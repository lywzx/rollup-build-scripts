import { stat as fsStat, readFile as readFileAsync, readdir as readdirAsync } from 'fs';
import { promisify } from 'util';
import { gzip as gzipAsync } from 'zlib';

export const stat = promisify(fsStat);

export const readFile = promisify(readFileAsync);

export const gzip = promisify(gzipAsync);

export const readdir = promisify(readdirAsync);
