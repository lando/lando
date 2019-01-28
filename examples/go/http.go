package main

import (
    "log"
    "net/http"
)

func Run(addr string) chan error {

    errs := make(chan error)

    // Starting HTTP server
    go func() {
        log.Printf("Staring HTTP service on %s ...", addr)

        if err := http.ListenAndServe(addr, nil); err != nil {
            errs <- err
        }

    }()

    return errs
}

func sampleHandler(w http.ResponseWriter, req *http.Request) {
    w.Header().Set("Content-Type", "text/plain")
    w.Write([]byte("<h1>TELL IT TO MY HEART.</h1>\n"))
}

func main() {
    http.HandleFunc("/", sampleHandler)

    errs := Run(":80")

    // This will run forever until channel receives error
    select {
    case err := <-errs:
        log.Printf("Could not start serving service due to (error: %s)", err)
    }

}
