# gravatar

minimal gravatar username availability checker

## usage

check single username:
```bash
node checker.js username
```

bulk check all words:
```bash
node bulk.js
```

## structure

```
gravatar/
├── checker.js     # single username checker
├── bulk.js        # bulk processing
└── data/
    ├── words.json     # word list to check
    └── available.txt  # available usernames
```

## features

- api integration with gravatar rest api
- accurate availability detection  
- clean output files
- 1000+ unique words from rare to technical terms

## output

- `available` - truly available for registration
- `taken` - username has active profile

---

created by [@nishimiya](https://x.com/nishimiya)