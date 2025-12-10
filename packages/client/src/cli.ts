#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { config, isConfigured } from './config.js';
import { api } from './api.js';
import { launchBrowser, stopBrowser, stopAllBrowsers, getRunningProfiles } from './browser.js';

const program = new Command();

program
  .name('multilogin')
  .description('Multilogin.io CLI - Manage and launch browser profiles')
  .version('1.0.0');

// Login command
program
  .command('login')
  .description('Authenticate with your API key')
  .option('-k, --key <key>', 'API key')
  .action(async (options) => {
    const spinner = ora();

    try {
      let apiKey = options.key;

      if (!apiKey) {
        const answers = await inquirer.prompt([
          {
            type: 'password',
            name: 'apiKey',
            message: 'Enter your API key:',
            mask: '*',
            validate: (input: string) => input.length > 0 || 'API key is required',
          },
        ]);
        apiKey = answers.apiKey;
      }

      config.set('apiKey', apiKey);
      spinner.start('Verifying API key...');

      const { user, team } = await api.verify();

      spinner.succeed(chalk.green('Authenticated successfully!'));
      console.log();
      console.log(chalk.dim('User:'), chalk.bold(user.name), chalk.dim(`(${user.email})`));
      console.log(chalk.dim('Team:'), chalk.bold(team.name), chalk.dim('[free forever]'));
      console.log();
      console.log(chalk.dim('Run'), chalk.cyan('multilogin list'), chalk.dim('to see your profiles'));
    } catch (error) {
      spinner.fail(chalk.red('Authentication failed'));
      config.set('apiKey', '');
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  });

// Logout command
program
  .command('logout')
  .description('Remove stored credentials')
  .action(() => {
    config.set('apiKey', '');
    console.log(chalk.green('Logged out successfully'));
  });

// List profiles command
program
  .command('list')
  .alias('ls')
  .description('List all browser profiles')
  .option('-s, --search <query>', 'Search by name')
  .option('-g, --group <id>', 'Filter by group ID')
  .action(async (options) => {
    if (!isConfigured()) {
      console.log(chalk.red('Not authenticated. Run'), chalk.cyan('multilogin login'), chalk.red('first.'));
      process.exit(1);
    }

    const spinner = ora('Fetching profiles...').start();

    try {
      const { profiles, total } = await api.listProfiles({
        search: options.search,
        groupId: options.group,
      });

      spinner.stop();

      if (profiles.length === 0) {
        console.log(chalk.dim('No profiles found'));
        return;
      }

      console.log(chalk.bold(`\nProfiles (${total}):\n`));

      const running = getRunningProfiles();

      for (const profile of profiles) {
        const isRunning = running.includes(profile.id);
        const status = isRunning
          ? chalk.green('● running')
          : profile.lockedBy
          ? chalk.yellow('◐ locked')
          : chalk.dim('○ idle');

        console.log(
          `  ${status}  ${chalk.bold(profile.name)}`,
          chalk.dim(`[${profile.id}]`)
        );

        if (profile.groupName) {
          console.log(chalk.dim(`         Group: ${profile.groupName}`));
        }
      }

      console.log();
    } catch (error) {
      spinner.fail(chalk.red('Failed to fetch profiles'));
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  });

// Launch profile command
program
  .command('launch <profileId>')
  .alias('start')
  .description('Launch a browser profile')
  .action(async (profileId) => {
    if (!isConfigured()) {
      console.log(chalk.red('Not authenticated. Run'), chalk.cyan('multilogin login'), chalk.red('first.'));
      process.exit(1);
    }

    const spinner = ora('Launching browser...').start();

    try {
      await launchBrowser(profileId);
      spinner.succeed(chalk.green('Browser launched successfully!'));
      console.log(chalk.dim('\nPress Ctrl+C to stop the browser and sync data.'));

      // Keep process running
      await new Promise((resolve) => {
        process.on('SIGINT', resolve);
        process.on('SIGTERM', resolve);
      });

      console.log(chalk.dim('\nShutting down...'));
      await stopBrowser(profileId);
    } catch (error) {
      spinner.fail(chalk.red('Failed to launch browser'));
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  });

// Stop profile command
program
  .command('stop [profileId]')
  .description('Stop a running browser profile (or all if no ID provided)')
  .action(async (profileId) => {
    const spinner = ora('Stopping browser...').start();

    try {
      if (profileId) {
        await stopBrowser(profileId);
        spinner.succeed(chalk.green('Browser stopped'));
      } else {
        await stopAllBrowsers();
        spinner.succeed(chalk.green('All browsers stopped'));
      }
    } catch (error) {
      spinner.fail(chalk.red('Failed to stop browser'));
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Show running profiles')
  .action(() => {
    const running = getRunningProfiles();

    if (running.length === 0) {
      console.log(chalk.dim('No browsers running'));
      return;
    }

    console.log(chalk.bold(`\nRunning profiles (${running.length}):\n`));
    for (const id of running) {
      console.log(`  ${chalk.green('●')} ${id}`);
    }
    console.log();
  });

// Groups command
program
  .command('groups')
  .description('List profile groups')
  .action(async () => {
    if (!isConfigured()) {
      console.log(chalk.red('Not authenticated. Run'), chalk.cyan('multilogin login'), chalk.red('first.'));
      process.exit(1);
    }

    const spinner = ora('Fetching groups...').start();

    try {
      const groups = await api.listGroups();
      spinner.stop();

      if (groups.length === 0) {
        console.log(chalk.dim('No groups found'));
        return;
      }

      console.log(chalk.bold('\nGroups:\n'));
      for (const group of groups) {
        console.log(`  ${group.color || '●'} ${chalk.bold(group.name)} ${chalk.dim(`(${group.profileCount} profiles)`)}`);
        console.log(chalk.dim(`    ID: ${group.id}`));
      }
      console.log();
    } catch (error) {
      spinner.fail(chalk.red('Failed to fetch groups'));
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  });

// Config command
program
  .command('config')
  .description('View or update configuration')
  .option('--api-url <url>', 'Set API URL')
  .option('--profiles-dir <path>', 'Set profiles directory')
  .option('--show', 'Show current configuration')
  .action((options) => {
    if (options.apiUrl) {
      config.set('apiUrl', options.apiUrl);
      console.log(chalk.green(`API URL set to ${options.apiUrl}`));
    }

    if (options.profilesDir) {
      config.set('profilesDir', options.profilesDir);
      console.log(chalk.green(`Profiles directory set to ${options.profilesDir}`));
    }

    if (options.show || (!options.apiUrl && !options.profilesDir)) {
      console.log(chalk.bold('\nConfiguration:\n'));
      console.log(`  ${chalk.dim('API URL:')}        ${config.get('apiUrl')}`);
      console.log(`  ${chalk.dim('Profiles dir:')}   ${config.get('profilesDir')}`);
      console.log(`  ${chalk.dim('Client ID:')}      ${config.get('clientId')}`);
      console.log(`  ${chalk.dim('Authenticated:')}  ${isConfigured() ? chalk.green('Yes') : chalk.red('No')}`);
      console.log();
    }
  });

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log(chalk.dim('\n\nShutting down...'));
  await stopAllBrowsers();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await stopAllBrowsers();
  process.exit(0);
});

program.parse();
