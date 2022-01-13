function stringToArrayBuffer(str) {
      var buf = new ArrayBuffer(str.length) // 2 bytes for each char
      var bufView = new Uint8Array(buf)
      for (var i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i)
      }
      return buf
}

function extractData(contents) {
      var zip = new require('node-zip')(contents, {base64: false, checkCRC32: true})
      var extracted = zip.files[Object.keys(zip.files)[0]]
      return stringToArrayBuffer(extracted['_data'])
}

function getData(link) {
      return new Promise((resolve) => {
            try {
                  var req = new XMLHttpRequest()
                  req.open('GET', link, false)
                  req.overrideMimeType('text/plain; charset=x-user-defined')
                  req.onload = () => {
                        const data = extractData(req.responseText)
                        resolve(data)
                  }
                  req.send(null)
            } catch (_) {
                  const https = __non_webpack_require__('https');

                  var dataChunks = [];
                  const req = https.request(link, {headers: {'accept-encoding': 'identity'}})
                  req.end();
                  req.on('response', res => {
                        res.setEncoding('binary')
                        res.on('data', (chunk) => dataChunks.push(Buffer.from(chunk, 'binary')));
                        res.on('end', () => resolve(extractData(Buffer.concat(dataChunks))));
                  });
            }
      })
}

function _b64ToUint8Array(b64) {
      var binary_string = atob(b64);
      var len = binary_string.length;
      var bytes = new Uint8Array(len);
      for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
      }
      return bytes

}
function _b64ToArrayBuffer(base64) {
      const bytes = _b64ToUint8Array(base64)
      return bytes.buffer;
}

const readResults = (fs, files) => files.reduce((result, file) => {
      try {
            const contents = fs.readFile(file, {encoding: 'utf8'})
            result[file] = btoa(contents)
      } catch (e) {}

      return result
}, {})

var _stdout = ""
var _stderr = ""

var Module = {
      preRun: [],
      postRun: [],
      totalDependencies: 0,
      preloadPlugins: [],
      print: (l) => _stdout += `[${new Date().toISOString()}] ${l}\n`,
      printErr: (l) => _stderr += `[${new Date().toISOString()}] ${l}\n`,

};

const preloadFiles = (FS, PATH, preload_files) => {
      Object.keys(preload_files).forEach((path) => {
            const parent_dir = PATH.dirname(path)
            FS.mkdirTree(parent_dir)
            FS.writeFile(path, _b64ToUint8Array(preload_files[path]))
      })
}

async function handleNewInput(callback, params, wasm, data_link, {preload_files, result_files}) {
      const preloadedDataPackage = await getData(data_link)
      const handleOutputFiles = () => callback(
            readResults(Module.FS, Object.keys(result_files)),
            btoa(_stdout),
            btoa(_stderr)
      )
      const putInputFiles = () => preloadFiles(Module.FS, Module.PATH, preload_files)

      Module["wasmBinary"] = _b64ToArrayBuffer(wasm)
      Module["getPreloadedPackage"] = () => preloadedDataPackage
      Module['postRun'].push(handleOutputFiles)
      Module['onAbort'] = (reason) => console.error(reason)
      Module['preRun'].push(putInputFiles)

      try {start(Module)} catch (e) {
            console.log('catched', e);
      }
}

function postMessageWrapper(message) {
      try {
            postMessage(message)
      } catch (_) {
            const {parentPort} = __non_webpack_require__('worker_threads')
            parentPort.postMessage(message)
      }
}

function onWebMessage(e) {
      const callback = (body, stdout, stderr) => postMessageWrapper({body, stdout, stderr})
      handleNewInput(callback, e.data.params, e.data.wasm, e.data.data_link, e.data)
}

function onNodeMessage(data) {
      const callback = (body, stdout, stderr) => postMessageWrapper({body, stdout, stderr})
      handleNewInput(callback, data.params, data.wasm, data.data_link, data)
}

onmessage = onWebMessage
try {
      const {parentPort} = __non_webpack_require__('worker_threads')
      parentPort.once('message', onNodeMessage);
} catch (_) {}

const start = (Module) => {
