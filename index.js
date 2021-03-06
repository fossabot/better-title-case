const { URL } = require('url');

const alwaysLowercase = [
	'a',
	'an',
	'and',
	'at',
	'but',
	'by',
	'for',
	'in',
	'nor',
	'of',
	'on',
	'or',
	'so',
	'the',
	'to',
	'up',
	'yet',
	'v',
	'v.',
	'vs',
	'vs.'
];

const containers = ['(', '[', '{', '"', `'`, '_'];

function isUrl(url) {
	try {
		const parsed = new URL(url);
		return Boolean(parsed.hostname);
	}
	catch (err) {
		return false;
	}
}

function capitalize(string) {
	if (string.length === 0) {
		return string;
	}

	const letters = [...string];
	const firstLetter = letters.shift();

	if (containers.indexOf(firstLetter) !== -1) {
		return `${firstLetter}${capitalize(letters)}`;
	}

	return `${firstLetter.toUpperCase()}${letters.join('')}`;
}

function titleCase(string = '', { excludedWords = [], useDefaultExcludedWords = true } = {}) {
	if (string.toUpperCase() === string) {
		string = string.toLowerCase();
	}

	if (useDefaultExcludedWords) {
		excludedWords.push(...alwaysLowercase);
	}

	const words = string.trim().split(/\s+/);

	const capitalizedWords = words.map((word, index, array) => {
		const isFirstWird = index === 0;
		const isLastWord = index === words.length - 1;
		const isEmail = /.+@.+\..+/.test(word);
		const isFilePath = /^(\/[\w.]+)+/.test(word);
		const isFileName = /^\w+\.\w{1,3}$/.test(word);
		const hasInternalCapital = /(?![-‑–—])[a-z]+[A-Z].*/.test(word);

		const previousWord = index > 1 ? array[index - 1] : '';
		const startOfSubPhrase = index > 1 && [...previousWord].pop() === ':';

		if (isEmail || isUrl(word) || isFilePath || isFileName || hasInternalCapital) {
			return word;
		}

		const hasHyphen = word.match(/[-‑–—]/g);
		if (hasHyphen) {
			const isMultiPart = hasHyphen.length > 1;
			const [hyphenCharacter] = hasHyphen;

			return word.split(hyphenCharacter).map((subWord) => {
				if (isMultiPart && excludedWords.indexOf(subWord.toLowerCase()) !== -1) {
					return subWord;
				}

				return capitalize(subWord);
			}).join(hyphenCharacter);
		}

		if (word.indexOf('/') !== -1) {
			return word.split('/').map(capitalize).join('/');
		}

		if (isFirstWird || isLastWord) {
			return capitalize(word);
		}

		if (!startOfSubPhrase && excludedWords.indexOf(word.toLowerCase()) !== -1) {
			return word.toLowerCase();
		}

		return capitalize(word);
	});

	return capitalizedWords.join(' ');
}

module.exports = titleCase;
