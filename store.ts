class KVStore {
  private store: Map<string, any>;

  constructor() {
    this.store = new Map();
  }

  get = async (key: string): Promise<any | undefined> => {
    return this.store.get(key);
  };

  set = async (key: string, value: any) => {
    return this.store.set(key, value);
  };

  delete = async (key: string): Promise<boolean> => {
    return this.store.delete(key);
  };
}

const KVStoreClient = new KVStore();

export default KVStoreClient;
