import Foundation

enum APIConfig {
    // Simulator / local Mac loopback (matches existing web: http://localhost:5001/api)
    static let simulatorBaseURL = URL(string: "http://127.0.0.1:5001/api")!

    // Physical device on same LAN as your Mac — replace with your Mac’s IP when you test on device.
    static let deviceBaseURL = URL(string: "http://192.168.0.100:5001/api")!

    // Hosted Render URL (placeholder; update when ready).
    static let renderBaseURL = URL(string: "https://<your-render-app>.onrender.com/api")!

    // Active base URL; tweak this if you want to force a specific endpoint.
    static var activeBaseURL: URL {
        #if targetEnvironment(simulator)
        return simulatorBaseURL
        #else
        return deviceBaseURL
        #endif
    }
}

