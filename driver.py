import asyncio
import time

from motivus.client import Client

config = {
    "run_type": "wasm",
    "wasm_path": "build/SPQR_mMC-1.0.0.wasm",
    "loader_path": "build/SPQR_mMC-1.0.0.js",
    "data_link": "https://down-production.s3.amazonaws.com/arn/SPQR_mMC-1.0.0.data.zip",
    "processing_base_time": 30,
    "flops": 45.0,
    "flop": 1.0,
    """
    Arguments can also be supplied as strings for the executable invocation
    """
    "arguments": []
}


async def mMC():
    """mMC.
    Reads mMC_input/ files used for worker input and waits for its results.
    Result files are stored in mMC_output/ directory as they arrive
    Worker execution logs can be found in .motivus/logs/
    """
    motivus = await Client.connect()

    print("Queuing mMC...")
    task_ids = []
    inicio = time.time()

    for i in range(10):
        metadata = {
            "preload_files": {
                """
                Here we define what the worker's starting filesystem should contain.
                The key is the location on which the file will be available in the worker fislesystem.
                The value is the file contents
                """
                '/params.spqr': motivus.read_file('mMC_input/params.spqr'),
                '/ermsd_frags.lst': motivus.read_file('mMC_input/ermsd_frags_a2.lst'),
                '/pdb_inits/init.p00.mc': motivus.read_file(f'mMC_input/init.p0{i}.mc')
            },
            "result_files": {
                """
                After the worker's execution ends, we gather some relevant files as output.
                The key is the file location in the worker filesystem.
                The value is where this file should be stored in the local filesystem.
                """
                '/ermsd_obs.p00.dat': f'mMC_output/ermsd_obs.p0{i}.dat',
                '/final.p00.pdb': f'mMC_output/final.p0{i}.pdb',
                '/configs/chk.last.p00.mc': f'mMC_output/configs/chk.last.p0{i}.mc'
            }
        }
        metadata.update(config)
        task_id = motivus.call_async(metadata)
        task_ids.append(task_id)

    await motivus.barrier(task_ids)

    fin = time.time()
    secs = fin - inicio
    print(f"Done in {secs} seconds")

asyncio.run(mMC())
