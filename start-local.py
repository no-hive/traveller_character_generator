"""Serve the unpacked generator on loopback using Python's standard library."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8000, help='Local port (default: 8000).')
    args = parser.parse_args()
    if not 0 <= args.port <= 65535:
        parser.error('Port must be between 0 and 65535.')
    handler = partial(SimpleHTTPRequestHandler, directory=str(Path(__file__).resolve().parent))
    try:
        with ThreadingHTTPServer(('127.0.0.1', args.port), handler) as server:
            port = server.server_address[1]
            print(f'Traveller: http://localhost:{port} — stop with Ctrl+C', flush=True)
            server.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped.')
    except OSError as error:
        raise SystemExit('Could not start the local server. Try --port 8001. Details: ' + str(error))


if __name__ == '__main__':
    main()
