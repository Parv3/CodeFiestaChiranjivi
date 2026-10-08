"""Curated high-popularity package lists for PyPI and npm.
Used for zero-latency local typo and masquerading analysis.
"""

# Most frequently downloaded Python packages (PyPI)
POPULAR_PYPI = [
    "requests", "boto3", "urllib3", "setuptools", "botocore", "certifi",
    "idna", "charset-normalizer", "pip", "typing-extensions", "wheel",
    "packaging", "six", "numpy", "s3transfer", "python-dateutil",
    "pyyaml", "cryptography", "pydantic", "attrs", "cffi", "pycparser",
    "click", "pandas", "importlib-metadata", "zipp", "tqdm", "jinja2",
    "markupsafe", "pytest", "scipy", "virtualenv", "pluggy", "platformdirs",
    "rich", "aiohttp", "multidict", "yarl", "frozenlist", "async-timeout",
    "aiosignal", "greenlet", "sqlalchemy", "pytz", "tomli", "filelock",
    "protobuf", "scikit-learn", "colorama", "torch", "cachetools",
    "google-api-python-client", "google-auth", "google-api-core", "grpcio",
    "matplotlib", "pillow", "soupsieve", "beautifulsoup4", "psutil",
    "pyasn1", "rsa", "sniffio", "anyio", "starlette", "fastapi",
    "uvicorn", "websockets", "httpx", "httpcore", "h11", "docker",
    "flask", "werkzeug", "itsdangerous", "wtforms", "pytest-cov",
    "coverage", "iniconfig", "exceptiongroup", "pathspec", "black",
    "flake8", "pycodestyle", "pyflakes", "mccabe", "mypy", "isort",
    "pylint", "astroid", "dill", "tabulate", "seaborn", "openpyxl",
    "nltk", "spacy", "networkx", "joblib", "threadpoolctl", "regex",
    "tensorboard", "torchvision", "torchaudio", "transformers",
    "tokenizers", "huggingface-hub", "safetensors", "accelerate",
    "peft", "diffusers", "datasets", "evaluate", "sentencepiece",
    "celery", "redis", "pika", "kombu", "amqp", "billiard", "vine",
    "alembic", "marshmallow", "django", "django-environ", "djangorestframework",
    "gunicorn", "gevent", "eventlet", "twisted", "tornado", "paramiko",
    "paramiko-ng", "fabric", "ansible", "kubernetes", "botostubs",
    "mypy-boto3-s3", "azure-core", "azure-storage-blob", "azure-identity",
    "pygments", "sphinx", "myst-parser", "mkdocs", "mkdocs-material",
    "lxml", "html5lib", "bleach", "pyopenssl", "service-identity",
    "oauthlib", "requests-oauthlib", "authlib", "pyjwt", "passlib",
    "bcrypt", "argon2-cffi", "keyring", "secretstorage", "jeepney",
    "dnspython", "email-validator", "humanize", "python-dotenv",
    "dotenv", "configparser", "jsonschema", "jsonpointer", "pyarrow",
    "fastparquet", "duckdb", "polars", "dask", "fsspec", "s3fs",
    "toolz", "cloudpickle", "msgpack", "ujson", "orjson", "simplejson",
    "prompt-toolkit", "wcwidth", "ptyprocess", "pexpect", "watchdog",
    "termcolor", "typer", "shellingham", "textual", "dash", "gradio",
    "streamlit", "altair", "bokeh", "plotly", "scikit-image", "opencv-python",
    "mediapipe", "shapely", "geopandas", "pyproj", "fiona", "rtree"
]

# Most frequently downloaded Node.js packages (npm)
POPULAR_NPM = [
    "lodash", "chalk", "react", "react-dom", "express", "axios",
    "tslib", "commander", "debug", "moment", "typescript", "glob",
    "fs-extra", "dotenv", "rxjs", "async", "uuid", "prop-types",
    "yargs", "semver", "minimist", "bluebird", "mkdirp", "core-js",
    "webpack", "babel-core", "@babel/core", "inquirer", "colors",
    "source-map", "cheerio", "underscore", "rimraf", "body-parser",
    "request", "ws", "path", "url", "http-errors", "cors", "morgan",
    "cookie-parser", "multer", "mongoose", "pg", "mysql", "mysql2",
    "sqlite3", "sequelize", "prisma", "@prisma/client", "typeorm",
    "knex", "redis", "ioredis", "mongodb", "jsonwebtoken", "bcrypt",
    "bcryptjs", "passport", "helmet", "express-validator", "joi",
    "zod", "yup", "validator", "superagent", "node-fetch", "got",
    "cross-fetch", "needle", "undici", "next", "vue", "nuxt",
    "svelte", "angular", "@angular/core", "@angular/common",
    "@angular/router", "gatsby", "remix", "astro", "vite", "esbuild",
    "rollup", "parcel", "turbo", "webpack-cli", "webpack-dev-server",
    "babel-loader", "ts-loader", "postcss", "autoprefixer", "tailwindcss",
    "sass", "less", "styled-components", "@emotion/react", "@emotion/styled",
    "clsx", "classnames", "lucide-react", "@heroicons/react",
    "jest", "mocha", "chai", "sinon", "vitest", "cypress", "@playwright/test",
    "playwright", "puppeteer", "@testing-library/react", "@testing-library/jest-dom",
    "eslint", "prettier", "husky", "lint-staged", "eslint-config-prettier",
    "nodemon", "ts-node", "tsx", "concurrently", "cross-env", "dotenv-cli",
    "chokidar", "charenc", "minimatch", "micromatch", "fast-glob",
    "socket.io", "socket.io-client", "graphql", "apollo-server",
    "@apollo/client", "dataloader", "pino", "winston", "bunyan",
    "log4js", "date-fns", "dayjs", "luxon", "decimal.js", "bignumber.js",
    "sharp", "jimp", "canvas", "pdfkit", "exceljs", "xlsx", "csv-parser",
    "archiver", "adm-zip", "tar", "unzipper", "crypto-js", "forge",
    "ssh2", "nodemailer", "aws-sdk", "@aws-sdk/client-s3", "firebase",
    "firebase-admin", "stripe", "openai", "@google/genai", "langchain"
]


def get_popular_list(ecosystem: str) -> list[str]:
    """Return top package list for given ecosystem."""
    if ecosystem.lower() in ("pip", "pypi", "python"):
        return POPULAR_PYPI
    elif ecosystem.lower() in ("npm", "node", "javascript", "js"):
        return POPULAR_NPM
    return POPULAR_PYPI + POPULAR_NPM
