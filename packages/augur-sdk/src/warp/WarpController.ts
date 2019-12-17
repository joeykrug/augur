import Dexie from 'dexie';
import * as IPFS from 'ipfs';
import * as Unixfs from 'ipfs-unixfs';
import { DAGNode } from 'ipld-dag-pb';

import { DB } from '../state/db/DB';
import { SyncableInterface } from '../state/types';

export const WARPSYNC_VERSION = '1';

export class WarpController {
  private static DEFAULT_NODE_TYPE = { format: 'dag-pb', hashAlg: 'sha2-256' };
  get ready() {
    return this.ipfs.ready;
  }


  static async create(db: DB) {
    const ipfs = await IPFS.create();
    return new WarpController(db, ipfs);
  }

  constructor(private db: SyncableInterface, private ipfs: IPFS) {
  }

  async createAllCheckpoints() {
    const topLevelDirectory = new DAGNode(Unixfs.default('directory').marshal());
    const versionFile = await this.ipfs.add({
      content: Buffer.from(WARPSYNC_VERSION),
    });
    topLevelDirectory.addLink({
      Name: 'VERSION',
      Hash: versionFile[0].hash,
      Size: 1,
    });

    topLevelDirectory.addLink(await this.buildDirectory('accounts'));
    topLevelDirectory.addLink(await this.buildDirectory('checkpoints'));
    topLevelDirectory.addLink(await this.buildDirectory('tables'));

    for(const table of this.db.databasesToSync()) {
      const r = await this.addDBToIPFS(table);
      // topLevelDirectory.addLink(r);
    }

    const d = await this.ipfs.dag.put(topLevelDirectory, WarpController.DEFAULT_NODE_TYPE);
    return d.toString();
  }

  async addDBToIPFS(table: Dexie.Table<any, any>) {
    const results = await this.ipfsAddRows(await table.toArray());

    const file = Unixfs.default('file');
    for (let i = 0; i < results.length; i++) {
      file.addBlockSize(results[i].size);
    }

    const indexFile = new DAGNode(file.marshal());
    for (let i = 0; i < results.length; i++) {
      indexFile.addLink({
        Hash: results[i].hash,
        Size: results[i].size
      });
    }

    const indexFileResponse = await this.ipfs.dag.put(indexFile, WarpController.DEFAULT_NODE_TYPE);

    const directory = Unixfs.default('directory');
    for (let i = 0; i < results.length; i++) {
      directory.addBlockSize(results[i].size);
    }

    directory.addBlockSize(file.fileSize());
    const directoryNode = new DAGNode(directory.marshal());
    for (let i = 0; i < results.length; i++) {
      directoryNode.addLink({
        Name: `file${i}`,
        Hash: results[i].hash,
        Size: results[i].size
      });
    }

    directoryNode.addLink({
      Name: 'index',
      Hash: indexFileResponse.toString(),
      Size: file.fileSize(),
    });

    const q = await this.ipfs.dag.put(directoryNode, WarpController.DEFAULT_NODE_TYPE);
    return {
      Name: table.name,
      Hash: q.toString(),
      Size: 0,
    }
  }

  private async buildDirectory(name: string) {
    const directoryNode = new DAGNode(Unixfs.default('directory').marshal());
    const result = await this.ipfs.dag.put(directoryNode, WarpController.DEFAULT_NODE_TYPE);
    return {
      Name: `${name}`,
      Hash: result,
      Size: 0,
    }
  }

  private async ipfsAddRows(rows: any[]):Promise<{ hash: string, size: string}[]> {
    return this.ipfs.add(rows.map((row, i) => ({
      content: Buffer.from(JSON.stringify(row))
    })));
  }
}
