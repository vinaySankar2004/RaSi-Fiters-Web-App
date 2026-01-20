import Foundation

struct APIError: LocalizedError {
    let message: String
    var errorDescription: String? { message }
}

final class APIClient {
    static let shared = APIClient()

    private let baseURL: URL
    private let session: URLSession
    var tokenUpdateHandler: ((String, String?) -> Void)?
    var authFailureHandler: (() -> Void)?

    init(baseURL: URL = APIConfig.activeBaseURL, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
    }

    // Quick connectivity check
    func healthCheck() async throws -> String {
        let request = URLRequest(url: baseURL.appendingPathComponent("test"))
        let data = try await data(for: request)
        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        return json?["message"] as? String ?? "OK"
    }

    // Legacy login (kept if needed elsewhere)
    func login(username: String, password: String) async throws -> AuthResponse {
        var request = URLRequest(url: baseURL.appendingPathComponent("auth/login"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["username": username, "password": password]
        request.httpBody = try JSONEncoder().encode(body)

        let data = try await data(for: request)
        return try JSONDecoder().decode(AuthResponse.self, from: data)
    }

    // New global-role-aware login
    func loginGlobal(username: String, password: String) async throws -> AuthResponse {
        var request = URLRequest(url: baseURL.appendingPathComponent("auth/login/global"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["username": username, "password": password]
        request.httpBody = try JSONEncoder().encode(body)

        let data = try await data(for: request)
        return try JSONDecoder().decode(AuthResponse.self, from: data)
    }

    struct TokenRefreshResponse: Decodable {
        let token: String
        let refreshToken: String?

        enum CodingKeys: String, CodingKey {
            case token
            case refreshToken = "refresh_token"
        }
    }

    func refreshSession(refreshToken: String) async throws -> TokenRefreshResponse {
        var request = URLRequest(url: baseURL.appendingPathComponent("auth/refresh"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["refresh_token": refreshToken]
        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await rawData(for: request)
        guard 200..<300 ~= response.statusCode else {
            let message = extractErrorMessage(from: data) ?? "Request failed (\(response.statusCode))"
            throw APIError(message: message)
        }
        return try JSONDecoder().decode(TokenRefreshResponse.self, from: data)
    }

    func logout(refreshToken: String) async throws {
        var request = URLRequest(url: baseURL.appendingPathComponent("auth/logout"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["refresh_token": refreshToken]
        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await rawData(for: request)
        guard 200..<300 ~= response.statusCode else {
            let message = extractErrorMessage(from: data) ?? "Request failed (\(response.statusCode))"
            throw APIError(message: message)
        }
    }

    // Analytics summary (period: day | week | month | year)
    func fetchAnalyticsSummary(token: String, period: String, programId: String?) async throws -> AnalyticsSummary {
        var components = URLComponents(url: baseURL.appendingPathComponent("analytics/summary"), resolvingAgainstBaseURL: false)!
        var items = [URLQueryItem(name: "period", value: period)]
        if let programId {
            items.append(URLQueryItem(name: "programId", value: programId))
        }
        components.queryItems = items

        guard let url = components.url else {
            throw APIError(message: "Invalid analytics URL")
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        let data = try await data(for: request)
        return try JSONDecoder().decode(AnalyticsSummary.self, from: data)
    }

    struct MemberDTO: Decodable, Identifiable {
        let id: String
        let member_name: String
        let username: String?
        let gender: String?
        let date_of_birth: String?
        let date_joined: String?
    }

    struct WorkoutDTO: Decodable {
        let workout_name: String
    }

    struct ProgramDTO: Decodable {
        let id: String
        let name: String
        let status: String?
        let start_date: String?
        let end_date: String?
        let active_members: Int?
        let total_members: Int?
        let progress_percent: Int?
        let enrollments_closed: Bool?
    }

    struct MTDParticipationDTO: Decodable {
        let total_members: Int
        let active_members: Int
        let participation_pct: Double
        let change_pct: Double
    }

    struct TotalWorkoutsMTDDTO: Decodable {
        let total_workouts: Int
        let change_pct: Double
    }

    struct TotalDurationMTDDTO: Decodable {
        let total_minutes: Int
        let change_pct: Double
    }

    struct AvgDurationMTDDTO: Decodable {
        let avg_minutes: Int
        let change_pct: Double
    }

    struct ActivityTimelinePoint: Decodable, Identifiable {
        let id = UUID()
        let date: String
        let label: String
        let workouts: Int
        let active_members: Int
    }

    struct ActivityTimelineResponse: Decodable {
        let mode: String
        let label: String
        let daily_average: Double
        let buckets: [ActivityTimelinePoint]
    }

    struct HealthTimelinePoint: Decodable, Identifiable {
        let id = UUID()
        let date: String
        let label: String
        let sleep_hours: Double
        let food_quality: Double
    }

    struct HealthTimelineResponse: Decodable {
        let mode: String
        let label: String
        let daily_average_sleep: Double
        let daily_average_food: Double
        let buckets: [HealthTimelinePoint]
        let start: String?
        let end: String?
    }

    struct DistributionByDayDTO: Decodable {
        let Sunday: Int
        let Monday: Int
        let Tuesday: Int
        let Wednesday: Int
        let Thursday: Int
        let Friday: Int
        let Saturday: Int
    }

    struct WorkoutTypeDTO: Decodable, Identifiable {
        let id = UUID()
        let workout_name: String
        let sessions: Int
        let total_duration: Int
        let avg_duration_minutes: Int
    }

    struct WorkoutTypesTotalDTO: Decodable {
        let total_types: Int
    }

    struct WorkoutTypeMostPopularDTO: Decodable {
        let workout_name: String?
        let sessions: Int
    }

    struct WorkoutTypeLongestDurationDTO: Decodable {
        let workout_name: String?
        let avg_minutes: Int
    }

    struct WorkoutTypeHighestParticipationDTO: Decodable {
        let workout_name: String?
        let participants: Int
        let participation_pct: Double
        let total_members: Int
    }

    func fetchMembers(token: String) async throws -> [MemberDTO] {
        var request = URLRequest(url: baseURL.appendingPathComponent("members"))
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode([MemberDTO].self, from: data)
    }

    func fetchProgramMembers(token: String, programId: String) async throws -> [MemberDTO] {
        var components = URLComponents(url: baseURL.appendingPathComponent("program-memberships/members"), resolvingAgainstBaseURL: false)!
        components.queryItems = [URLQueryItem(name: "programId", value: programId)]
        guard let url = components.url else { throw APIError(message: "Invalid program members URL") }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode([MemberDTO].self, from: data)
    }

    /// Fetches members NOT enrolled in the specified program (available for enrollment)
    func fetchAvailableMembers(token: String, programId: String) async throws -> [MemberDTO] {
        var components = URLComponents(url: baseURL.appendingPathComponent("program-memberships/available"), resolvingAgainstBaseURL: false)!
        components.queryItems = [URLQueryItem(name: "programId", value: programId)]
        guard let url = components.url else { throw APIError(message: "Invalid available members URL") }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode([MemberDTO].self, from: data)
    }

    struct EnrollMemberResponse: Decodable {
        let member_id: String
        let member_name: String
        let username: String
        let gender: String?
        let date_of_birth: String?
        let date_joined: String?
        let program_id: String
        let message: String?
    }

    /// Enrolls an existing member into a program (creates ProgramMembership only)
    func enrollExistingMember(token: String, memberId: String, programId: String, joinedAt: String?) async throws -> EnrollMemberResponse {
        var request = URLRequest(url: baseURL.appendingPathComponent("program-memberships/enroll"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        var body: [String: Any] = [
            "member_id": memberId,
            "program_id": programId
        ]
        if let joinedAt { body["joined_at"] = joinedAt }

        request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
        let data = try await data(for: request)
        return try JSONDecoder().decode(EnrollMemberResponse.self, from: data)
    }

    func fetchWorkouts(token: String) async throws -> [WorkoutDTO] {
        var request = URLRequest(url: baseURL.appendingPathComponent("workouts"))
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode([WorkoutDTO].self, from: data)
    }

    func addWorkoutType(token: String, workoutName: String) async throws -> WorkoutDTO {
        var request = URLRequest(url: baseURL.appendingPathComponent("workouts/mobile"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let body = ["workout_name": workoutName]
        request.httpBody = try JSONEncoder().encode(body)
        let data = try await data(for: request)
        return try JSONDecoder().decode(WorkoutDTO.self, from: data)
    }

    func fetchPrograms(token: String) async throws -> [ProgramDTO] {
        var request = URLRequest(url: baseURL.appendingPathComponent("programs"))
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode([ProgramDTO].self, from: data)
    }

    struct DeleteProgramResponse: Decodable {
        let id: String
        let message: String
    }

    func deleteProgram(token: String, programId: String) async throws -> DeleteProgramResponse {
        var request = URLRequest(url: baseURL.appendingPathComponent("programs/\(programId)"))
        request.httpMethod = "DELETE"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode(DeleteProgramResponse.self, from: data)
    }

    struct CreateProgramResponse: Decodable {
        let id: String
        let name: String
        let status: String
        let start_date: String?
        let end_date: String?
        let message: String?
    }

    func createProgram(token: String, name: String, status: String, startDate: String?, endDate: String?) async throws -> CreateProgramResponse {
        var request = URLRequest(url: baseURL.appendingPathComponent("programs"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        var body: [String: Any] = [
            "name": name,
            "status": status
        ]
        if let startDate { body["start_date"] = startDate }
        if let endDate { body["end_date"] = endDate }
        
        request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
        let data = try await data(for: request)
        return try JSONDecoder().decode(CreateProgramResponse.self, from: data)
    }

    func fetchMTDParticipation(token: String, programId: String) async throws -> MTDParticipationDTO {
        var components = URLComponents(url: baseURL.appendingPathComponent("analytics-v2/participation/mtd"), resolvingAgainstBaseURL: false)!
        components.queryItems = [URLQueryItem(name: "programId", value: programId)]
        guard let url = components.url else {
            throw APIError(message: "Invalid MTD participation URL")
        }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode(MTDParticipationDTO.self, from: data)
    }

    func fetchTotalWorkoutsMTD(token: String, programId: String) async throws -> TotalWorkoutsMTDDTO {
        var components = URLComponents(url: baseURL.appendingPathComponent("analytics/workouts/total"), resolvingAgainstBaseURL: false)!
        components.queryItems = [URLQueryItem(name: "programId", value: programId)]
        guard let url = components.url else {
            throw APIError(message: "Invalid total workouts URL")
        }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode(TotalWorkoutsMTDDTO.self, from: data)
    }

    func fetchTotalDurationMTD(token: String, programId: String) async throws -> TotalDurationMTDDTO {
        var components = URLComponents(url: baseURL.appendingPathComponent("analytics/duration/total"), resolvingAgainstBaseURL: false)!
        components.queryItems = [URLQueryItem(name: "programId", value: programId)]
        guard let url = components.url else {
            throw APIError(message: "Invalid total duration URL")
        }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode(TotalDurationMTDDTO.self, from: data)
    }

    func fetchAvgDurationMTD(token: String, programId: String) async throws -> AvgDurationMTDDTO {
        var components = URLComponents(url: baseURL.appendingPathComponent("analytics/duration/average"), resolvingAgainstBaseURL: false)!
        components.queryItems = [URLQueryItem(name: "programId", value: programId)]
        guard let url = components.url else {
            throw APIError(message: "Invalid average duration URL")
        }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode(AvgDurationMTDDTO.self, from: data)
    }

    func fetchActivityTimeline(token: String, period: String, programId: String) async throws -> ActivityTimelineResponse {
        var components = URLComponents(url: baseURL.appendingPathComponent("analytics/timeline"), resolvingAgainstBaseURL: false)!
        components.queryItems = [
            URLQueryItem(name: "period", value: period),
            URLQueryItem(name: "programId", value: programId)
        ]
        guard let url = components.url else {
            throw APIError(message: "Invalid timeline URL")
        }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode(ActivityTimelineResponse.self, from: data)
    }

    func fetchHealthTimeline(
        token: String,
        period: String,
        programId: String,
        memberId: String? = nil
    ) async throws -> HealthTimelineResponse {
        var components = URLComponents(url: baseURL.appendingPathComponent("analytics/health/timeline"), resolvingAgainstBaseURL: false)!
        var items = [
            URLQueryItem(name: "period", value: period),
            URLQueryItem(name: "programId", value: programId)
        ]
        if let memberId {
            items.append(URLQueryItem(name: "memberId", value: memberId))
        }
        components.queryItems = items
        guard let url = components.url else {
            throw APIError(message: "Invalid health timeline URL")
        }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode(HealthTimelineResponse.self, from: data)
    }

    func fetchDistributionByDay(token: String, programId: String) async throws -> DistributionByDayDTO {
        var components = URLComponents(url: baseURL.appendingPathComponent("analytics/distribution/day"), resolvingAgainstBaseURL: false)!
        components.queryItems = [URLQueryItem(name: "programId", value: programId)]
        guard let url = components.url else {
            throw APIError(message: "Invalid distribution URL")
        }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode(DistributionByDayDTO.self, from: data)
    }

    func fetchWorkoutTypes(token: String, programId: String, memberId: String? = nil, limit: Int = 100) async throws -> [WorkoutTypeDTO] {
        var components = URLComponents(url: baseURL.appendingPathComponent("analytics/workouts/types"), resolvingAgainstBaseURL: false)!
        var items = [
            URLQueryItem(name: "programId", value: programId),
            URLQueryItem(name: "limit", value: "\(limit)")
        ]
        if let memberId {
            items.append(URLQueryItem(name: "memberId", value: memberId))
        }
        components.queryItems = items
        guard let url = components.url else {
            throw APIError(message: "Invalid workout types URL")
        }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode([WorkoutTypeDTO].self, from: data)
    }

    func fetchWorkoutTypesTotal(token: String, programId: String, memberId: String? = nil) async throws -> WorkoutTypesTotalDTO {
        var components = URLComponents(url: baseURL.appendingPathComponent("analytics-v2/workouts/types/total"), resolvingAgainstBaseURL: false)!
        var items = [URLQueryItem(name: "programId", value: programId)]
        if let memberId {
            items.append(URLQueryItem(name: "memberId", value: memberId))
        }
        components.queryItems = items
        guard let url = components.url else {
            throw APIError(message: "Invalid workout types total URL")
        }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode(WorkoutTypesTotalDTO.self, from: data)
    }

    func fetchWorkoutTypeMostPopular(token: String, programId: String, memberId: String? = nil) async throws -> WorkoutTypeMostPopularDTO {
        var components = URLComponents(url: baseURL.appendingPathComponent("analytics-v2/workouts/types/most-popular"), resolvingAgainstBaseURL: false)!
        var items = [URLQueryItem(name: "programId", value: programId)]
        if let memberId {
            items.append(URLQueryItem(name: "memberId", value: memberId))
        }
        components.queryItems = items
        guard let url = components.url else {
            throw APIError(message: "Invalid workout types most popular URL")
        }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode(WorkoutTypeMostPopularDTO.self, from: data)
    }

    func fetchWorkoutTypeLongestDuration(token: String, programId: String, memberId: String? = nil) async throws -> WorkoutTypeLongestDurationDTO {
        var components = URLComponents(url: baseURL.appendingPathComponent("analytics-v2/workouts/types/longest-duration"), resolvingAgainstBaseURL: false)!
        var items = [URLQueryItem(name: "programId", value: programId)]
        if let memberId {
            items.append(URLQueryItem(name: "memberId", value: memberId))
        }
        components.queryItems = items
        guard let url = components.url else {
            throw APIError(message: "Invalid workout types longest duration URL")
        }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode(WorkoutTypeLongestDurationDTO.self, from: data)
    }

    func fetchWorkoutTypeHighestParticipation(token: String, programId: String, memberId: String? = nil) async throws -> WorkoutTypeHighestParticipationDTO {
        var components = URLComponents(url: baseURL.appendingPathComponent("analytics-v2/workouts/types/highest-participation"), resolvingAgainstBaseURL: false)!
        var items = [URLQueryItem(name: "programId", value: programId)]
        if let memberId {
            items.append(URLQueryItem(name: "memberId", value: memberId))
        }
        components.queryItems = items
        guard let url = components.url else {
            throw APIError(message: "Invalid workout types highest participation URL")
        }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode(WorkoutTypeHighestParticipationDTO.self, from: data)
    }

    func addWorkoutLog(token: String, memberName: String, workoutName: String, date: String, durationMinutes: Int, programId: String?, memberId: String?) async throws {
        var request = URLRequest(url: baseURL.appendingPathComponent("workout-logs"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        var body: [String: Any] = [
            "member_name": memberName,
            "workout_name": workoutName,
            "date": date,
            "duration": durationMinutes
        ]
        if let programId { body["program_id"] = programId }
        if let memberId { body["member_id"] = memberId }
        request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
        _ = try await data(for: request)
    }

    func addDailyHealthLog(
        token: String,
        programId: String,
        memberId: String?,
        logDate: String,
        sleepHours: Double?,
        foodQuality: Int?
    ) async throws {
        var request = URLRequest(url: baseURL.appendingPathComponent("daily-health-logs"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        var body: [String: Any] = [
            "program_id": programId,
            "log_date": logDate
        ]
        if let memberId { body["member_id"] = memberId }
        if let sleepHours { body["sleep_hours"] = sleepHours }
        if let foodQuality { body["food_quality"] = foodQuality }

        request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
        _ = try await data(for: request)
    }

    func fetchMemberHealthLogs(
        token: String,
        programId: String,
        memberId: String,
        limit: Int = 1000,
        startDate: String? = nil,
        endDate: String? = nil,
        sortBy: String? = nil,
        sortDir: String? = nil
    ) async throws -> MemberHealthLogResponse {
        var components = URLComponents(url: baseURL.appendingPathComponent("daily-health-logs"), resolvingAgainstBaseURL: false)!
        var queryItems = [
            URLQueryItem(name: "programId", value: programId),
            URLQueryItem(name: "memberId", value: memberId),
            URLQueryItem(name: "limit", value: "\(limit)")
        ]
        if let startDate { queryItems.append(URLQueryItem(name: "startDate", value: startDate)) }
        if let endDate { queryItems.append(URLQueryItem(name: "endDate", value: endDate)) }
        if let sortBy { queryItems.append(URLQueryItem(name: "sortBy", value: sortBy)) }
        if let sortDir { queryItems.append(URLQueryItem(name: "sortDir", value: sortDir)) }
        components.queryItems = queryItems
        guard let url = components.url else { throw APIError(message: "Invalid daily health logs URL") }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode(MemberHealthLogResponse.self, from: data)
    }

    func updateDailyHealthLog(
        token: String,
        programId: String,
        memberId: String?,
        logDate: String,
        sleepHours: Double?,
        foodQuality: Int?
    ) async throws {
        var request = URLRequest(url: baseURL.appendingPathComponent("daily-health-logs"))
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        var body: [String: Any] = [
            "program_id": programId,
            "log_date": logDate
        ]
        if let memberId { body["member_id"] = memberId }
        if let sleepHours { body["sleep_hours"] = sleepHours }
        if let foodQuality { body["food_quality"] = foodQuality }

        request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
        _ = try await data(for: request)
    }

    func deleteDailyHealthLog(
        token: String,
        programId: String,
        memberId: String?,
        logDate: String
    ) async throws {
        var request = URLRequest(url: baseURL.appendingPathComponent("daily-health-logs"))
        request.httpMethod = "DELETE"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        var body: [String: Any] = [
            "program_id": programId,
            "log_date": logDate
        ]
        if let memberId { body["member_id"] = memberId }
        request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
        _ = try await data(for: request)
    }

    struct MemberDetailDTO: Decodable {
        let id: String
        let member_name: String
        let username: String
        let gender: String?
        let date_of_birth: String?
        let date_joined: String?
        let role: String?
        let program_id: String?
    }

    struct MemberMetricsDTO: Decodable, Identifiable {
        let id = UUID()
        let member_id: String
        let member_name: String
        let username: String
        let workouts: Int
        let total_duration: Int
        let avg_duration: Int
        let avg_sleep_hours: Double?
        let active_days: Int
        let workout_types: Int
        let current_streak: Int
        let longest_streak: Int
        let avg_food_quality: Int?
        let mtd_workouts: Int?
        let total_hours: Int?
        let favorite_workout: String?
    }

    struct MemberMetricsResponse: Decodable {
        let program_id: String
        let total: Int
        let filtered: Int
        let sort: String
        let direction: String
        let date_range: DateRangeDTO?
        let members: [MemberMetricsDTO]
    }

    struct DateRangeDTO: Decodable {
        let start: String?
        let end: String?
    }

    struct MemberHistoryPoint: Decodable, Identifiable {
        let id = UUID()
        let date: String
        let label: String
        let workouts: Int
    }

    struct MemberHistoryResponse: Decodable {
        let period: String
        let label: String
        let daily_average: Double
        let start: String
        let end: String
        let buckets: [MemberHistoryPoint]
    }

    struct MemberStreaksResponse: Decodable {
        struct Milestone: Decodable, Identifiable {
            let id = UUID()
            let dayValue: Int
            let achieved: Bool
        }
        let currentStreakDays: Int
        let longestStreakDays: Int
        let milestones: [Milestone]
    }

    struct MemberRecentWorkoutsResponse: Decodable {
        struct Item: Decodable, Identifiable {
            let id: String
            let workoutType: String
            let workoutDate: String
            let durationMinutes: Int
        }
        struct Filters: Decodable {
            let startDate: String?
            let endDate: String?
            let sortBy: String
            let sortDir: String
        }
        let items: [Item]
        let total: Int?
        let filters: Filters?
    }

    struct MemberHealthLogResponse: Decodable {
        struct Item: Decodable, Identifiable {
            let id: String
            let logDate: String
            let sleepHours: Double?
            let foodQuality: Int?
        }
        struct Filters: Decodable {
            let startDate: String?
            let endDate: String?
            let sortBy: String
            let sortDir: String
        }
        let items: [Item]
        let total: Int?
        let filters: Filters?
    }
    
    struct DeleteWorkoutLogResponse: Decodable {
        let message: String
    }

    // DTO for program membership with role info
    struct MembershipDetailDTO: Decodable, Identifiable {
        var id: String { member_id }
        let member_id: String
        let member_name: String
        let username: String?
        let gender: String?
        let date_of_birth: String?
        let date_joined: String?
        let global_role: String?
        let program_role: String
        let is_active: Bool
        let joined_at: String?
    }

    struct ProgramUpdateResponse: Decodable {
        let id: String
        let name: String
        let status: String
        let start_date: String?
        let end_date: String?
        let message: String?
    }

    struct MembershipUpdateResponse: Decodable {
        let program_id: String
        let member_id: String
        let member_name: String?
        let role: String
        let is_active: Bool
        let joined_at: String?
        let message: String?
    }

    struct MemberUpdateResponse: Decodable {
        let message: String
    }

    func addMember(token: String,
                   memberName: String,
                   password: String,
                   gender: String?,
                   dateOfBirth: String?,
                   dateJoined: String?,
                   programId: String) async throws -> MemberDetailDTO {
        var request = URLRequest(url: baseURL.appendingPathComponent("program-memberships"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        var body: [String: Any] = [
            "member_name": memberName,
            "password": password,
            "program_id": programId
        ]
        if let gender { body["gender"] = gender }
        if let dateOfBirth { body["date_of_birth"] = dateOfBirth }
        if let dateJoined { body["date_joined"] = dateJoined }

        request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
        let data = try await data(for: request)
        return try JSONDecoder().decode(MemberDetailDTO.self, from: data)
    }

    func fetchMemberMetrics(token: String,
                            programId: String,
                            search: String? = nil,
                            sort: String? = nil,
                            direction: String? = nil,
                            memberId: String? = nil,
                            filters: [String: String]? = nil) async throws -> MemberMetricsResponse {
        var components = URLComponents(url: baseURL.appendingPathComponent("member-metrics"), resolvingAgainstBaseURL: false)!
        var items: [URLQueryItem] = [URLQueryItem(name: "programId", value: programId)]
        if let search, !search.isEmpty { items.append(URLQueryItem(name: "search", value: search)) }
        if let sort { items.append(URLQueryItem(name: "sort", value: sort)) }
        if let direction { items.append(URLQueryItem(name: "direction", value: direction)) }
        if let memberId { items.append(URLQueryItem(name: "memberId", value: memberId)) }
        if let filters {
            for (k, v) in filters where !v.isEmpty {
                items.append(URLQueryItem(name: k, value: v))
            }
        }
        components.queryItems = items
        guard let url = components.url else { throw APIError(message: "Invalid member metrics URL") }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        let data = try await data(for: request)
        return try JSONDecoder().decode(MemberMetricsResponse.self, from: data)
    }

    func fetchMemberHistory(token: String, programId: String, memberId: String, period: String) async throws -> MemberHistoryResponse {
        var components = URLComponents(url: baseURL.appendingPathComponent("member-history"), resolvingAgainstBaseURL: false)!
        components.queryItems = [
            URLQueryItem(name: "programId", value: programId),
            URLQueryItem(name: "memberId", value: memberId),
            URLQueryItem(name: "period", value: period)
        ]
        guard let url = components.url else { throw APIError(message: "Invalid member history URL") }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode(MemberHistoryResponse.self, from: data)
    }

    func fetchMemberStreaks(token: String, programId: String, memberId: String) async throws -> MemberStreaksResponse {
        var components = URLComponents(url: baseURL.appendingPathComponent("member-streaks"), resolvingAgainstBaseURL: false)!
        components.queryItems = [
            URLQueryItem(name: "programId", value: programId),
            URLQueryItem(name: "memberId", value: memberId)
        ]
        guard let url = components.url else { throw APIError(message: "Invalid member streaks URL") }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode(MemberStreaksResponse.self, from: data)
    }

    func fetchMemberRecentWorkouts(
        token: String,
        programId: String,
        memberId: String,
        limit: Int = 1000,
        startDate: String? = nil,
        endDate: String? = nil,
        sortBy: String? = nil,
        sortDir: String? = nil
    ) async throws -> MemberRecentWorkoutsResponse {
        var components = URLComponents(url: baseURL.appendingPathComponent("member-recent"), resolvingAgainstBaseURL: false)!
        var queryItems = [
            URLQueryItem(name: "programId", value: programId),
            URLQueryItem(name: "memberId", value: memberId),
            URLQueryItem(name: "limit", value: "\(limit)")
        ]
        if let startDate { queryItems.append(URLQueryItem(name: "startDate", value: startDate)) }
        if let endDate { queryItems.append(URLQueryItem(name: "endDate", value: endDate)) }
        if let sortBy { queryItems.append(URLQueryItem(name: "sortBy", value: sortBy)) }
        if let sortDir { queryItems.append(URLQueryItem(name: "sortDir", value: sortDir)) }
        components.queryItems = queryItems
        guard let url = components.url else { throw APIError(message: "Invalid member recent URL") }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode(MemberRecentWorkoutsResponse.self, from: data)
    }
    
    func deleteWorkoutLog(token: String, memberId: String, workoutName: String, date: String) async throws {
        var request = URLRequest(url: baseURL.appendingPathComponent("workout-logs"))
        request.httpMethod = "DELETE"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        let body: [String: Any] = [
            "member_id": memberId,
            "workout_name": workoutName,
            "date": date
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
        _ = try await data(for: request)
    }

    // MARK: - Program Management

    func updateProgram(token: String, programId: String, name: String?, status: String?, startDate: String?, endDate: String?) async throws -> ProgramUpdateResponse {
        var request = URLRequest(url: baseURL.appendingPathComponent("programs/\(programId)"))
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        var body: [String: Any] = [:]
        if let name { body["name"] = name }
        if let status { body["status"] = status }
        if let startDate { body["start_date"] = startDate }
        if let endDate { body["end_date"] = endDate }
        
        request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
        let data = try await data(for: request)
        return try JSONDecoder().decode(ProgramUpdateResponse.self, from: data)
    }

    // MARK: - Membership Management

    func fetchMembershipDetails(token: String, programId: String) async throws -> [MembershipDetailDTO] {
        var components = URLComponents(url: baseURL.appendingPathComponent("program-memberships/details"), resolvingAgainstBaseURL: false)!
        components.queryItems = [URLQueryItem(name: "programId", value: programId)]
        guard let url = components.url else { throw APIError(message: "Invalid membership details URL") }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode([MembershipDetailDTO].self, from: data)
    }

    func updateMembership(token: String, programId: String, memberId: String, role: String?, isActive: Bool?, joinedAt: String?) async throws -> MembershipUpdateResponse {
        var request = URLRequest(url: baseURL.appendingPathComponent("program-memberships"))
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        var body: [String: Any] = [
            "program_id": programId,
            "member_id": memberId
        ]
        if let role { body["role"] = role }
        if let isActive { body["is_active"] = isActive }
        if let joinedAt { body["joined_at"] = joinedAt }
        
        request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
        let data = try await data(for: request)
        return try JSONDecoder().decode(MembershipUpdateResponse.self, from: data)
    }

    func removeMemberFromProgram(token: String, programId: String, memberId: String) async throws {
        var request = URLRequest(url: baseURL.appendingPathComponent("program-memberships"))
        request.httpMethod = "DELETE"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        let body: [String: Any] = [
            "program_id": programId,
            "member_id": memberId
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
        _ = try await data(for: request)
    }

    // MARK: - Member Profile Management

    func updateMemberProfile(token: String, memberId: String, gender: String?, dateOfBirth: String?, password: String?, dateJoined: String?) async throws -> MemberUpdateResponse {
        var request = URLRequest(url: baseURL.appendingPathComponent("members/\(memberId)"))
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        var body: [String: Any] = [:]
        if let gender { body["gender"] = gender }
        if let dateOfBirth { body["date_of_birth"] = dateOfBirth }
        if let password { body["password"] = password }
        if let dateJoined { body["date_joined"] = dateJoined }
        
        request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
        let data = try await data(for: request)
        return try JSONDecoder().decode(MemberUpdateResponse.self, from: data)
    }

    func fetchMemberById(token: String, memberId: String) async throws -> MemberDTO {
        var request = URLRequest(url: baseURL.appendingPathComponent("members/\(memberId)"))
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let data = try await data(for: request)
        return try JSONDecoder().decode(MemberDTO.self, from: data)
    }

    // MARK: - Workout Type Management

    func updateWorkoutType(token: String, oldName: String, newName: String) async throws -> WorkoutDTO {
        let encodedName = oldName.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? oldName
        var request = URLRequest(url: baseURL.appendingPathComponent("workouts/\(encodedName)"))
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        let body = ["workout_name": newName]
        request.httpBody = try JSONEncoder().encode(body)
        let data = try await data(for: request)
        return try JSONDecoder().decode(WorkoutDTO.self, from: data)
    }

    func deleteWorkoutType(token: String, workoutName: String) async throws {
        let encodedName = workoutName.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? workoutName
        var request = URLRequest(url: baseURL.appendingPathComponent("workouts/\(encodedName)"))
        request.httpMethod = "DELETE"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        _ = try await data(for: request)
    }

    // MARK: - Helpers

    private func data(for request: URLRequest, allowRefresh: Bool = true) async throws -> Data {
        let (data, response) = try await rawData(for: request)

        if response.statusCode == 401, allowRefresh, shouldAttemptRefresh(for: request) {
            do {
                if let newToken = try await refreshAccessTokenIfPossible() {
                    var retryRequest = request
                    if request.value(forHTTPHeaderField: "Authorization") != nil {
                        retryRequest.setValue("Bearer \(newToken)", forHTTPHeaderField: "Authorization")
                    }
                    let (retryData, retryResponse) = try await rawData(for: retryRequest)
                    guard 200..<300 ~= retryResponse.statusCode else {
                        let message = extractErrorMessage(from: retryData) ?? "Request failed (\(retryResponse.statusCode))"
                        if retryResponse.statusCode == 401 {
                            authFailureHandler?()
                        }
                        throw APIError(message: message)
                    }
                    return retryData
                }
            } catch {
                authFailureHandler?()
            }
        }

        guard 200..<300 ~= response.statusCode else {
            let message = extractErrorMessage(from: data) ?? "Request failed (\(response.statusCode))"
            throw APIError(message: message)
        }
        return data
    }

    private func rawData(for request: URLRequest) async throws -> (Data, HTTPURLResponse) {
        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw APIError(message: "No response")
        }
        return (data, http)
    }

    private func refreshAccessTokenIfPossible() async throws -> String? {
        guard let refreshToken = SessionStore.shared.refreshToken else { return nil }
        let response = try await refreshSession(refreshToken: refreshToken)
        let newRefreshToken = response.refreshToken ?? refreshToken
        SessionStore.shared.saveTokens(accessToken: response.token, refreshToken: newRefreshToken)
        tokenUpdateHandler?(response.token, newRefreshToken)
        return response.token
    }

    private func shouldAttemptRefresh(for request: URLRequest) -> Bool {
        guard let url = request.url else { return false }
        if request.value(forHTTPHeaderField: "Authorization") == nil {
            return false
        }
        let path = url.path
        if path.contains("/auth/refresh") || path.contains("/auth/login") || path.contains("/auth/logout") {
            return false
        }
        return true
    }

    private func extractErrorMessage(from data: Data) -> String? {
        if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            return (json["error"] as? String) ?? (json["message"] as? String)
        }
        return nil
    }
}
