import asyncio
import time

from motivus.client import Client

algorithm = {
    # "wasm_path": "build/spqr-mmc-0.0.1.wasm",
    # "loader_path": "build/spqr-mmc-0.0.1.js",
    # "data_link": "http://localhost:8000/spqr-mmc-0.0.1.data.zip",
    "algorithm": "spqr-mmc",
    "algorithm_version": "0.0.1"
}


async def mMC():
    """mMC.
    Reads input/ files used for worker input and waits for its results.
    Result files are stored in output/ directory as they arrive
    Worker execution logs can be found in .motivus/logs/
    """
    motivus = await Client.connect()

    print("Queuing mMC...")
    task_ids = []
    inicio = time.time()

    for i in range(10):
        metadata = {
            "preload_files": {
                '/params.spqr': motivus.read_file('input/params.spqr'),
                '/ermsd_frags.lst': motivus.read_file(f'input/ermsd/ermsd_frags_{i}.lst'),
                '/spqr_inits/init.p00.mc': motivus.read_file(f'input/init.mc')
            },
            "result_files": {
                '/ermsd_obs.p00.dat': f'output/ermsd_obs.p0{i}.dat',
                '/final.p00.pdb': f'output/final.p0{i}.pdb',
                '/configs/chk.last.p00.mc': f'output/configs/chk.last.p0{i}.mc'
            }
        }
        metadata.update(algorithm)
        task_id = motivus.call_async(metadata)
        task_ids.append(task_id)

    await motivus.barrier(task_ids)

    fin = time.time()
    secs = fin - inicio
    print(f"Done in {secs} seconds")

asyncio.run(mMC())
