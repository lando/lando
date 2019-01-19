package main

import (
    "log"
    "net/http"
)

func Run(addr string, sslAddr string, ssl map[string]string) chan error {

    errs := make(chan error)

    // Starting HTTP server
    go func() {
        log.Printf("Staring HTTP service on %s ...", addr)

        if err := http.ListenAndServe(addr, nil); err != nil {
            errs <- err
        }

    }()

    // Starting HTTPS server
    go func() {
        log.Printf("Staring HTTPS service on %s ...", sslAddr)
        if err := http.ListenAndServeTLS(sslAddr, ssl["cert"], ssl["key"], nil); err != nil {
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

    errs := Run(":80", ":443", map[string]string{
        "cert": "/certs/cert.crt",
        "key":  "/certs/cert.key",
    })

    // This will run forever until channel receives error
    select {
    case err := <-errs:
        log.Printf("Could not start serving service due to (error: %s)", err)
    }

}
