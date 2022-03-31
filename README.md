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
Tip: When the flag `-D` is set, `stdout` and `stderr` will print to worker console instead of a log file.
- Package is then created in `build` directory

**Important**: when making changes to `filesystem/` the `.data.zip` link used in the driver should also be updated. 

## Running the algorithm
### Running steps
#### Testing in local environment
- Start a loop-back worker for local task execution:
```sh
$ motivus loopback
```
- Set the environment value to point the driver execution to the loop-back server via .env file
```sh
# .env
WEBSOCKET_URI=ws://localhost:7070/client_socket/websocket
```
- Run the driver
`python driver.py`
- All tasks are sent to the worker for processing.
- The result files are stored in `output` directory.

#### Running on Motivus cluster
You will need a valid `application_token` to run tasks on Motivus cluster.
- Make the following environment variables available in current session via a .env file
```sh
# .env
APPLICATION_TOKEN=<your application token>
```
- Run the driver
`python driver.py`
- All tasks are sent to the Motivus cluster available workers for processing.
- The result files are stored in `output` directory.

# Using as a template for other C/C++ projects
Several files are relevant:
- `Makefile` describes the compilation steps:
    - It is based on the program's source `Makefile.in`
    - Uses the emscripten compiler with a JS/WASM output target.
    - It is required that you define an `app` target, with `emscripten` compiler. Some environment variables are present when executing `motivus build`:
        - `OBJ_DIR`: where intermediate compilation files are located.
        - `SOURCE_DIR`: where the source files are located, as specified in `motivus.yml`
        - `BUILD_DIR`: where the files result of the compilation are stored, as specified in `motivus.yml`
        - `FILESYSTEM_DIR`: a directory which should be used as starting filesystem on algorithm execution, as specified in `motivus.yml`
        - `PACKAGE`: the name of the algorithm including its version. Must be used as output file names.
        
- `motivus.yml` is a configuration file that describes metadata for building, packaging and publishing algorithms.
- `filesystem/` refers to the files available during execution on a worker's virtual file system: It is required that contains at least one file.
