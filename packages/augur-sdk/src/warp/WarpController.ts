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


  public async createAllCheckpoints() {
    const results:{hash: string, size: string}[] = await this.ipfsAddRows('/events/MarketCreated', 'market', await this.db.MarketCreated.toArray());

    const file = Unixfs.default('file');

    for (let i = 0; i < results.length; i++) {
      file.addBlockSize(results[i].size);
    }

    const omnibus = new DAGNode(file.marshal());
    for (let i = 0; i < results.length; i++) {
      omnibus.addLink({
        Hash: results[i].hash,
        Size: results[i].size
      });
    }

    const r = await this.ipfs.dag.put(omnibus, WarpController.DEFAULT_NODE_TYPE);

    console.log(results);
    console.log(r.toString());
  }

  private async ipfsAddChunk(data: Buffer) {

  }

  private async ipfsAddRows(path: string, id: string, rows: Array<any>) {
    const results = this.ipfs.add(rows.map((row, i) => ({
      content: Buffer.from(JSON.stringify(row))
    })));

    console.log(results);
    return results;
  }

  async addBlock(block: string[]) {
    console.log("Adding block")
    const blockData = Buffer.from(block.join("\n"));
    return await this.ipfs.add([{
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
