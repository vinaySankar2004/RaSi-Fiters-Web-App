import SwiftUI

struct AppRootView: View {
    @StateObject private var programContext = ProgramContext()

    var body: some View {
        Group {
            if programContext.authToken != nil {
                // Authenticated: show program picker flow
                NavigationStack {
                    ProgramPickerView()
                }
            } else {
                // Unauthenticated: show splash/login flow
                NavigationStack {
                    SplashView()
                }
            }
        }
        .environmentObject(programContext)
        .task {
            await programContext.refreshSessionIfNeeded()
        }
    }
}

#Preview {
    AppRootView()
}
