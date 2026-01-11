import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import type { StoredCredentials, GitInfo, PlatformType } from '../types/index.js';

const KODUS_DIR = path.join(os.homedir(), '.kodus');
const CREDENTIALS_FILE = path.join(KODUS_DIR, 'credentials.json');

async function ensureKodusDir(): Promise<void> {
  try {
    await fs.mkdir(KODUS_DIR, { recursive: true, mode: 0o700 });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

export async function loadCredentials(): Promise<StoredCredentials | null> {
  try {
    const content = await fs.readFile(CREDENTIALS_FILE, 'utf-8');
    return JSON.parse(content) as StoredCredentials;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

export async function saveCredentials(credentials: StoredCredentials): Promise<void> {
  await ensureKodusDir();
  await fs.writeFile(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2), {
    encoding: 'utf-8',
    mode: 0o600,
  });
}

export async function clearCredentials(): Promise<void> {
  try {
    await fs.unlink(CREDENTIALS_FILE);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

export async function credentialsExist(): Promise<boolean> {
  try {
    await fs.access(CREDENTIALS_FILE);
    return true;
  } catch {
    return false;
  }
}

