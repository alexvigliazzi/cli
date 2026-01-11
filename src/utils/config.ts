import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.kodus');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export interface CliConfig {
  teamKey: string;
  teamName: string;
  organizationName: string;
}

async function ensureConfigDir(): Promise<void> {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

export async function saveConfig(config: CliConfig): Promise<void> {
  await ensureConfigDir();
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), {
    encoding: 'utf-8',
    mode: 0o600,
  });
}

export async function loadConfig(): Promise<CliConfig | null> {
  try {
    const content = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(content) as CliConfig;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

export async function clearConfig(): Promise<void> {
  try {
    await fs.unlink(CONFIG_FILE);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

export async function configExists(): Promise<boolean> {
  try {
    await fs.access(CONFIG_FILE);
    return true;
  } catch {
    return false;
  }
}
