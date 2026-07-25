import * as fs from 'fs';
import * as path from 'path';

export interface CommandDefinition {
  description: string;
  inputs: string[];
  outputs: string[];
  handler: (inputs: Record<string, any>) => Promise<Record<string, any>> | Record<string, any>;
}

export class UILPlugin {
  public name: string;
  public description: string;
  private commands: Map<string, CommandDefinition> = new Map();

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }

  public registerCommand(
    commandName: string,
    description: string,
    inputs: string[],
    outputs: string[],
    handler: (inputs: Record<string, any>) => Promise<Record<string, any>> | Record<string, any>
  ): void {
    this.commands.set(commandName, {
      description,
      inputs,
      outputs,
      handler
    });
  }

  public async executeCommand(commandName: string, inputs: Record<string, any>): Promise<Record<string, any>> {
    const command = this.commands.get(commandName);
    if (!command) {
      throw new Error(`Command '${commandName}' is not registered in plugin '${this.name}'.`);
    }
    return await command.handler(inputs);
  }

  public generateManifest(): Record<string, any> {
    const commandsManifest: Record<string, { inputs: string[]; outputs: string[] }> = {};
    this.commands.forEach((cmd, key) => {
      commandsManifest[key] = {
        inputs: cmd.inputs,
        outputs: cmd.outputs
      };
    });

    return {
      name: this.name,
      description: this.description,
      manifest: {
        commands: commandsManifest
      }
    };
  }

  public writeManifestFile(filePath: string): void {
    const manifestData = this.generateManifest();
    fs.writeFileSync(filePath, JSON.stringify(manifestData, null, 2), 'utf-8');
  }
}
