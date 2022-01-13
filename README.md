# Motivus C example; SPQR

*Compilation and usage of an existing C program as a Motivus cluster's algorithm; SPQR - SPlit and conQueR for RNA structure prediction*

## Requirements
- Docker
- Python >= 3.7
- [Motivus CLI and Motivus Client library](https://pypi.org/project/motivus/):
```sh
$ pip install motivus
```

## Building the program
### Compilation steps
- Make sure the program spqr source code is present (or clone using `git clone --recurse-submodules`)
- Extract `filesystem/interactions/intrac.btb.zip` contents. This is a file required to be present for any execution of the program and is handled specially.
```sh
$ cd filesystem/interactions && unzip intrac.btb.zip
```
- Start compilation and packaging of the algorithm
```sh
$ motivus build
```
Tip: When the flag `--dev` is set, `stdout` and `stderr` will print to worker console instead of a log file.
- Package is then created in `build` directory

**Important**: when making changes to `filesystem/` the `.data.zip` link used in the driver should also be updated. 

## Running the algorithm
### Running steps
#### Testing in local environment
- Start a loop-back worker for local task execution:
```sh
$ motivus loopback
```
- Set the environment value to point the driver execution to the loop-back server
```sh
export WEBSOCKET_URI=ws://localhost:7070/client_socket/websocket
```
- Run the driver
`python driver.py`
- All tasks are sent to the worker for processing.
- The result files are stored in `mMC_output` directory.

#### Running on Motivus cluster
You will need a valid `application_token` to run tasks on Motivus cluster.
- Make the following environment variables available in current session
```sh
export WEBSOCKET_URI=wss://waterbear.api.motivus.cl/client_socket/websocket
export APPLICATION_TOKEN=<your application token>
```
- Run the driver
`python driver.py`
- All tasks are sent to the Motivus cluster available workers for processing.
- The result files are stored in `mMC_output` directory.

# Using as a template for other C/C++ projects
Several files are relevant:
- `Makefile` describes all the compilation and packaging steps:
    - It is based on the program source's `Makefile.in`
    - Uses the emscripten compiler with a JS/WASM output target.
    - Bundles all files into one compressed archive for marketplace publishing.
- `waterbear.emscripten.js` is the *glue* code that communicates Motivus and the emscripten module.
- `webpack.config.js` handles the transformation of the worker code for web and node environments.
- `package.json` lists dependencies for webpack bundler.
- `motivus.yml` is a configuration file that describes metadata for building, packaging and publishing algorithms.
- `filesystem/` refers to the files available during execution on a worker's virtual file system: It is required that contains at least one file.
