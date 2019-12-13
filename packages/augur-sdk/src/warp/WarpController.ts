import Dexie from 'dexie';
import * as IPFS from 'ipfs';
import * as Unixfs from 'ipfs-unixfs';
import { DAGNode } from 'ipld-dag-pb';

import { DB } from '../state/db/DB';

export class WarpController {
  private static DEFAULT_NODE_TYPE = { format: 'dag-pb', hashAlg: 'sha2-256' };
  get ready() {
    return this.ipfs.ready;
  }


  static async create(db: DB) {
    const ipfs = await IPFS.create();
    return new WarpController(db, ipfs);
  }

  constructor(private db: DB, private ipfs: IPFS) {
  }

  async createAllCheckpoints() {
    const otherDir = new DAGNode(Unixfs.default('directory').marshal());
    for(const table of this.db.databasesToSync()) {
      const r = await this.addDBToIPFS(table);
      otherDir.addLink(r);
    }

    const d = await this.ipfs.dag.put(otherDir, WarpController.DEFAULT_NODE_TYPE);
    console.log(d.toString());
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
      console.log(results[i]);
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

  private async ipfsAddChunk(data: Buffer) {

  }

  private async ipfsAddRows(rows: any[]):Promise<{ hash: string, size: string}[]> {
    return this.ipfs.add(rows.map((row, i) => ({
      content: Buffer.from(JSON.stringify(row))
    })));
  }

  async addBlock(block: string[]) {
    console.log("Adding block")
    const blockData = Buffer.from(block.join("\n"));
    return this.ipfs.add([{
      path: '/augur-warp/chunk1',
      content: blockData
    }, {
      path: '/augur-warp/chunk2',
      content: blockData.slice(0,10005)
    }], {
      chunker: 'size-10000'
    });
  }
}
