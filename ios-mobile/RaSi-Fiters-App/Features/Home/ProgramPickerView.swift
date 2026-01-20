import SwiftUI

struct ProgramPickerView: View {
    @EnvironmentObject var programContext: ProgramContext
    @Environment(\.colorScheme) private var colorScheme

    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showDeleteConfirmation = false
    @State private var programToDelete: APIClient.ProgramDTO?
    @State private var isDeleting = false
    @State private var showCreateProgram = false

    var body: some View {
        ZStack(alignment: .top) {
            Color.appBackground
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 18) {
                    Color.clear.frame(height: 100)

                    if isLoading {
                        ProgressView().padding(.top, 40)
                    } else if let errorMessage {
                        Text(errorMessage)
                            .foregroundColor(.appRed)
                            .font(.footnote.weight(.semibold))
                            .padding(.top, 20)
                    } else if programContext.programs.isEmpty {
                        emptyState
                    } else {
                        ForEach(programContext.programs, id: \.id) { program in
                            NavigationLink {
                                AdminHomeView()
                                    .environmentObject(programContext)
                            } label: {
                                ProgramCard(
                                    program: program,
                                    showDeleteButton: programContext.isGlobalAdmin,
                                    onDelete: {
                                        programToDelete = program
                                        showDeleteConfirmation = true
                                    }
                                )
                            }
                            .buttonStyle(.plain)
                            .simultaneousGesture(
                                TapGesture().onEnded {
                                    applyProgram(program)
                                }
                            )
                        }
                    }

                    if programContext.isGlobalAdmin {
                        createProgramButton
                            .padding(.top, 4)
                            .padding(.bottom, 20)
                    }
                }
                .padding(.horizontal, 20)
            }

            pickerHeader
                .padding(.horizontal, 16)
                .padding(.top, 12)
        }
        .navigationBarBackButtonHidden(true)
        .task {
            await loadPrograms()
        }
        .alert("Delete Program?", isPresented: $showDeleteConfirmation) {
            Button("Cancel", role: .cancel) {
                programToDelete = nil
            }
            Button("Delete", role: .destructive) {
                if let program = programToDelete {
                    Task {
                        await deleteProgram(program)
                    }
                }
            }
        } message: {
            if let program = programToDelete {
                Text("Are you sure you want to delete \"\(program.name)\"? This action cannot be undone.")
            }
        }
    }

    private var pickerHeader: some View {
        HStack(alignment: .center, spacing: 14) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Select Program")
                    .font(.largeTitle.weight(.bold))
                    .foregroundColor(Color(.label))
                Text("Pick a program to manage")
                    .font(.headline.weight(.semibold))
                    .foregroundColor(Color(.secondaryLabel))
            }

            Spacer()

            ZStack {
                Circle()
                    .fill(AppGradient.accent(for: colorScheme))
                    .frame(width: 52, height: 52)
                Text(programContext.loggedInUserInitials)
                    .font(.headline.weight(.bold))
                    .foregroundColor(.black)
            }
        }
        .padding(.horizontal, 4)
    }

    private func deleteProgram(_ program: APIClient.ProgramDTO) async {
        guard let token = programContext.authToken else { return }
        isDeleting = true
        do {
            try await programContext.deleteProgram(programId: program.id)
            programToDelete = nil
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
            }
        }
        isDeleting = false
    }

    private var createProgramButton: some View {
        Button {
            showCreateProgram = true
        } label: {
            HStack(spacing: 10) {
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 18, weight: .semibold))
                Text("Create program")
                    .font(.headline.weight(.semibold))
            }
            .foregroundColor(colorScheme == .dark ? .black : .white)
            .padding(.vertical, 14)
            .frame(maxWidth: .infinity)
            .background(
                Capsule()
                    .fill(Color(.label))
            )
            .adaptiveShadow(radius: 10, y: 5)
        }
        .sheet(isPresented: $showCreateProgram) {
            CreateProgramView()
                .environmentObject(programContext)
        }
    }

    private var emptyState: some View {
        VStack(spacing: 10) {
            Text("No programs yet")
                .font(.headline.weight(.semibold))
                .foregroundColor(Color(.label))
            Text("Create a program to get started.")
                .font(.subheadline)
                .foregroundColor(Color(.secondaryLabel))
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(Color(.systemGray6))
        )
    }

    private func applyProgram(_ program: APIClient.ProgramDTO) {
        programContext.name = program.name
        programContext.status = (program.status ?? "Active")
        programContext.programId = program.id
        programContext.activeMembers = program.active_members ?? 0
        programContext.totalWorkouts = 0
        programContext.atRiskMembers = 0

        let formatterIn = DateFormatter()
        formatterIn.dateFormat = "yyyy-MM-dd"
        if let startString = program.start_date, let d = formatterIn.date(from: startString) {
            programContext.startDate = d
        }
        if let endString = program.end_date, let d = formatterIn.date(from: endString) {
            programContext.endDate = d
        }

        programContext.persistSession()

        // Load membership details to get the user's role in this program
        Task {
            await programContext.loadMembershipDetails()
            await programContext.loadLookupData()
        }
    }

    private func loadPrograms() async {
        guard let token = programContext.authToken, !token.isEmpty else {
            errorMessage = "Please log in to load programs."
            return
        }
        isLoading = true
        errorMessage = nil
        do {
            let programs = try await APIClient.shared.fetchPrograms(token: token)
            await MainActor.run {
                programContext.programs = programs
            }
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
            }
        }
        isLoading = false
    }
}

private struct ProgramCard: View {
    @Environment(\.colorScheme) private var colorScheme
    let program: APIClient.ProgramDTO
    let showDeleteButton: Bool
    let onDelete: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(program.name)
                    .font(.headline.weight(.semibold))
                    .foregroundColor(Color(.label))
                Spacer()
                StatusPill(text: program.status ?? "Active", color: statusColor(program.status))
            }

            Text(dateRange(program))
                .font(.subheadline)
                .foregroundColor(Color(.secondaryLabel))

            Text(membersSummary(program))
                .font(.footnote.weight(.semibold))
                .foregroundColor(Color(.tertiaryLabel))

            ProgressView(value: progressValue(program))
                .accentColor(statusColor(program.status))
                .scaleEffect(x: 1, y: 1.1, anchor: .center)

            HStack {
                if showDeleteButton {
                    Button {
                        onDelete()
                    } label: {
                        Image(systemName: "trash")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(.appRedSoft)
                    }
                    .buttonStyle(.plain)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(Color(.tertiaryLabel))
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(Color.appBackgroundSecondary)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .stroke(Color(.systemGray4).opacity(0.5), lineWidth: 1)
        )
        .adaptiveShadow(radius: 12, y: 6)
    }

    private func dateRange(_ program: APIClient.ProgramDTO) -> String {
        let formatterIn = DateFormatter()
        formatterIn.dateFormat = "yyyy-MM-dd"
        let formatterOut = DateFormatter()
        formatterOut.dateFormat = "MMM d, yyyy"
        let start = program.start_date.flatMap { formatterIn.date(from: $0) }.map { formatterOut.string(from: $0) } ?? "Start"
        let end = program.end_date.flatMap { formatterIn.date(from: $0) }.map { formatterOut.string(from: $0) } ?? "End"
        return "\(start) – \(end)"
    }

    private func membersSummary(_ program: APIClient.ProgramDTO) -> String {
        let active = program.active_members ?? 0
        let total = program.total_members ?? 0
        return "\(active) active / \(total) total members"
    }

    private func progressValue(_ program: APIClient.ProgramDTO) -> Double {
        let total = program.total_members ?? 0
        guard total > 0 else { return 0 }
        let active = program.active_members ?? 0
        return min(max(Double(active) / Double(total), 0), 1)
    }

    private func statusColor(_ status: String?) -> Color {
        switch (status ?? "").lowercased() {
        case "planned": return .appBlue
        case "draft": return .gray
        default: return .appOrange
        }
    }
}

private struct StatusPill: View {
    let text: String
    let color: Color

    var body: some View {
        Text(text.uppercased())
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(
                Capsule()
                    .fill(color.opacity(0.18))
            )
            .foregroundColor(color)
    }
}

private struct CreateProgramView: View {
    @EnvironmentObject var programContext: ProgramContext
    @Environment(\.dismiss) private var dismiss
    @Environment(\.colorScheme) private var colorScheme

    @State private var programName: String = ""
    @State private var status: String = "planned"
    @State private var startDate: Date = Date()
    @State private var endDate: Date = Calendar.current.date(byAdding: .month, value: 3, to: Date()) ?? Date()
    @State private var isSaving = false
    @State private var errorMessage: String?
    @State private var showSuccessAlert = false

    private let statusOptions = ["planned", "active", "completed"]

    private var isFormValid: Bool {
        !programName.trimmingCharacters(in: .whitespaces).isEmpty
    }

    private var accentColor: Color {
        Color.appOrange
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    header
                    formFields

                    if let errorMessage {
                        Text(errorMessage)
                            .foregroundColor(.appRed)
                            .font(.footnote.weight(.semibold))
                    }

                    Button(action: { Task { await save() } }) {
                        if isSaving {
                            ProgressView().tint(colorScheme == .dark ? .black : .white)
                        } else {
                            Text("Create program")
                                .font(.headline.weight(.semibold))
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(isFormValid ? accentColor : Color(.systemGray3))
                    .foregroundColor(.black)
                    .cornerRadius(14)
                    .disabled(!isFormValid || isSaving)
                }
                .padding(20)
            }
            .background(
                AppGradient.sheetBackground(for: colorScheme)
                    .ignoresSafeArea()
            )
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(Color(.label))
                }
            }
            .alert("Program created", isPresented: $showSuccessAlert) {
                Button("OK") {
                    dismiss()
                }
            } message: {
                Text("Your new program has been created successfully.")
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Create program")
                .font(.title2.weight(.bold))
                .foregroundColor(Color(.label))
            Text("Set up a new fitness program.")
                .font(.subheadline)
                .foregroundColor(Color(.secondaryLabel))
        }
    }

    private var formFields: some View {
        VStack(spacing: 14) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Program name")
                    .font(.subheadline.weight(.semibold))
                TextField("e.g. Summer 2026 Challenge", text: $programName)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.words)
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("Status")
                    .font(.subheadline.weight(.semibold))
                Menu {
                    ForEach(statusOptions, id: \.self) { option in
                        Button(option.capitalized) { status = option }
                    }
                } label: {
                    HStack {
                        Text(status.capitalized)
                            .foregroundColor(Color(.label))
                        Spacer()
                        Image(systemName: "chevron.up.chevron.down")
                            .foregroundColor(Color(.tertiaryLabel))
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                }
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("Start date")
                    .font(.subheadline.weight(.semibold))
                DatePicker("", selection: $startDate, displayedComponents: .date)
                    .labelsHidden()
                    .datePickerStyle(.compact)
                    .padding(.horizontal)
                    .frame(maxWidth: .infinity, minHeight: 52, alignment: .leading)
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("End date")
                    .font(.subheadline.weight(.semibold))
                DatePicker("", selection: $endDate, displayedComponents: .date)
                    .labelsHidden()
                    .datePickerStyle(.compact)
                    .padding(.horizontal)
                    .frame(maxWidth: .infinity, minHeight: 52, alignment: .leading)
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
            }
        }
    }

    private func save() async {
        isSaving = true
        errorMessage = nil

        do {
            try await programContext.createProgram(
                name: programName.trimmingCharacters(in: .whitespacesAndNewlines),
                status: status,
                startDate: startDate,
                endDate: endDate
            )
            showSuccessAlert = true
        } catch {
            errorMessage = error.localizedDescription
        }

        isSaving = false
    }
}

#Preview {
    NavigationStack {
        ProgramPickerView()
            .environmentObject(ProgramContext())
    }
}
