# Collecie iOS App — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working Collecie iOS app (MVP) covering auth, store management, collection data recording, and the home dashboard, sharing the existing Supabase backend.

**Architecture:** MVVM + Repository layer with SwiftUI (@Observable ViewModels) and Supabase Swift SDK. Repository layer abstracts all data access; Views only call ViewModel methods. DB schema migrations run first as a prerequisite.

**Tech Stack:** Swift 5.9+, SwiftUI, SwiftData, Supabase Swift SDK 2.x, Network framework, XCTest, iOS 17.0+

---

## Phase Scope

**This plan (Phase 1):** DB migrations · Xcode setup · Auth · Navigation shell · Store CRUD · Collect CRUD (online only) · Home dashboard · Basic Settings

**Phase 2 (separate plan):** Offline sync · Inventory/MachineState · Org management · Push notifications

---

## File Map

```
Collecie/
├── App/
│   ├── CollecieApp.swift
│   └── AppRouter.swift
├── Config/
│   └── Secrets.xcconfig           ← gitignored
├── Models/
│   ├── DTO/
│   │   ├── Store.swift
│   │   ├── CollectFund.swift
│   │   ├── Profile.swift
│   │   ├── Organization.swift
│   │   └── ActionMessage.swift
│   └── SwiftData/
│       ├── PendingCollect.swift    ← Phase 2 で使用、今は空スタブ
│       └── UserPreferences.swift
├── Services/
│   ├── SupabaseService.swift
│   ├── NetworkMonitor.swift
│   └── AppError.swift
├── Auth/
│   ├── AuthRepository.swift
│   ├── AuthState.swift
│   ├── LoginView.swift
│   ├── SignupView.swift
│   └── ForgotPasswordView.swift
├── Navigation/
│   ├── MainTabView.swift
│   └── RoleBasedView.swift
├── Features/
│   ├── Home/
│   │   ├── HomeView.swift
│   │   └── HomeViewModel.swift
│   ├── Store/
│   │   ├── StoreRepository.swift
│   │   ├── StoreListView.swift
│   │   ├── StoreListViewModel.swift
│   │   ├── StoreDetailView.swift
│   │   ├── StoreDetailViewModel.swift
│   │   ├── StoreFormView.swift     ← New/Edit 共用
│   │   └── StoreFormViewModel.swift
│   ├── Collect/
│   │   ├── CollectRepository.swift
│   │   ├── CollectListView.swift
│   │   ├── CollectListViewModel.swift
│   │   ├── CollectNewView.swift
│   │   ├── CollectNewViewModel.swift
│   │   └── CollectEditView.swift
│   └── Settings/
│       ├── ProfileRepository.swift
│       ├── SettingsView.swift
│       └── AccountEditView.swift
└── Components/
    ├── RoleBasedView.swift
    ├── ErrorBanner.swift
    └── LoadingOverlay.swift

CollecieTests/
├── Auth/
│   └── AuthRepositoryTests.swift
├── Features/
│   ├── Store/
│   │   └── StoreListViewModelTests.swift
│   └── Collect/
│       └── CollectNewViewModelTests.swift
└── Helpers/
    └── MockRepositories.swift
```

---

## Task 1: Supabase DB — `device_tokens` テーブル追加

**Files:**
- Supabase SQL Editor で実行（ファイルなし）

- [ ] **Step 1: Supabase Dashboard → SQL Editor で以下を実行**

```sql
CREATE TABLE public.device_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  token text NOT NULL,
  platform text DEFAULT 'ios',
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, token)
);

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own device tokens"
  ON public.device_tokens
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

- [ ] **Step 2: テーブルが作成されたことを Table Editor で確認**

---

## Task 2: Supabase DB — `laundry_state` スキーマ更新

`detergent`/`softener` カラムを廃止し `inventory` JSONB へ移行。`machines` に `hasFault` フラグを追加。

**Files:**
- Supabase SQL Editor で実行（ファイルなし）

- [ ] **Step 1: カラム追加**

```sql
ALTER TABLE public.laundry_state
  ADD COLUMN IF NOT EXISTS inventory jsonb DEFAULT '[]'::jsonb;
```

- [ ] **Step 2: 既存データをマイグレーション**

```sql
UPDATE public.laundry_state
SET inventory = jsonb_build_array(
  jsonb_build_object(
    'id', 'det',
    'name', '洗剤',
    'quantity', COALESCE(detergent, 0),
    'unit', '%',
    'threshold', 20
  ),
  jsonb_build_object(
    'id', 'sof',
    'name', '柔軟剤',
    'quantity', COALESCE(softener, 0),
    'unit', '%',
    'threshold', 20
  )
)
WHERE detergent IS NOT NULL OR softener IS NOT NULL;
```

- [ ] **Step 3: 古いカラムを削除**

```sql
ALTER TABLE public.laundry_state
  DROP COLUMN IF EXISTS detergent,
  DROP COLUMN IF EXISTS softener;
```

- [ ] **Step 4: `machines` の既存データに `hasFault` フラグを追加**

```sql
UPDATE public.laundry_state
SET machines = (
  SELECT jsonb_agg(
    elem || jsonb_build_object('hasFault', false)
  )
  FROM jsonb_array_elements(machines) AS elem
)
WHERE jsonb_array_length(machines) > 0;
```

- [ ] **Step 5: Table Editor で `laundry_state` を確認し、`inventory` カラムが存在し `detergent`/`softener` が消えていることを確認**

---

## Task 3: Xcode プロジェクト作成

- [ ] **Step 1: Xcode → File → New → Project → App**

設定:
- Product Name: `Collecie`
- Team: 自分のApple Developer アカウント
- Bundle Identifier: `com.yourname.collecie`（任意）
- Interface: SwiftUI
- Language: Swift
- **Use SwiftData にチェックを入れる**
- Minimum Deployments: iOS 17.0

- [ ] **Step 2: Supabase Swift SDK を SPM で追加**

File → Add Package Dependencies → 以下のURLを入力:
```
https://github.com/supabase/supabase-swift
```
バージョン: `Up to Next Major Version` from `2.0.0`  
Product: `Supabase` にチェックしてAdd。

- [ ] **Step 3: `Secrets.xcconfig` を作成してAPIキーを設定**

プロジェクトルートに `Secrets.xcconfig` を作成:
```
SUPABASE_URL = https://xxxxxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIs...
```

`.gitignore` に追記:
```
Secrets.xcconfig
```

- [ ] **Step 4: `Info.plist` にキーを追加**

Xcode の Info.plist（またはターゲットの Info タブ）に以下を追加:
```
SUPABASE_URL → $(SUPABASE_URL)
SUPABASE_ANON_KEY → $(SUPABASE_ANON_KEY)
```

- [ ] **Step 5: ビルドが通ることを確認**

`Cmd+B` でビルド。エラーがないこと。

- [ ] **Step 6: コミット**

```bash
git add Collecie/ Collecie.xcodeproj/
git commit -m "chore(ios): initialize Xcode project with Supabase Swift SDK"
```

---

## Task 4: DTO モデル

**Files:**
- Create: `Collecie/Models/DTO/Store.swift`
- Create: `Collecie/Models/DTO/CollectFund.swift`
- Create: `Collecie/Models/DTO/Profile.swift`
- Create: `Collecie/Models/DTO/Organization.swift`
- Create: `Collecie/Models/DTO/ActionMessage.swift`

- [ ] **Step 1: `Store.swift` を作成**

```swift
import Foundation

struct Store: Codable, Identifiable {
    let id: UUID
    let store: String
    let location: String
    let description: String
    let machines: [Machine]
    let images: [String]
    let owner: UUID
    let organizationId: UUID?

    enum CodingKeys: String, CodingKey {
        case id, store, location, description, machines, images, owner
        case organizationId = "organization_id"
    }
}

struct Machine: Codable, Identifiable {
    let id: String
    let name: String
    var status: String
    var hasFault: Bool

    enum CodingKeys: String, CodingKey {
        case id, name, status, hasFault
    }
}

struct NewStore: Encodable {
    let store: String
    let location: String
    let description: String
    let machines: [Machine]
    let organizationId: UUID?

    enum CodingKeys: String, CodingKey {
        case store, location, description, machines
        case organizationId = "organization_id"
    }
}
```

- [ ] **Step 2: `CollectFund.swift` を作成**

```swift
import Foundation

struct CollectFund: Codable, Identifiable {
    let id: UUID
    let laundryId: UUID
    let laundryName: String?
    let date: Int64
    let fundsArray: [FundsItem]?
    let totalFunds: Int64
    let collecter: UUID?

    enum CodingKeys: String, CodingKey {
        case id, date, totalFunds, collecter, fundsArray
        case laundryId = "laundryId"
        case laundryName = "laundryName"
    }
}

struct FundsItem: Codable {
    let machineId: String
    let machineName: String
    let amount: Int64

    enum CodingKeys: String, CodingKey {
        case machineId, machineName, amount
    }
}

struct NewCollectFund: Encodable {
    let laundryId: UUID
    let laundryName: String
    let date: Int64
    let fundsArray: [FundsItem]
    let totalFunds: Int64

    enum CodingKeys: String, CodingKey {
        case laundryId = "laundryId"
        case laundryName = "laundryName"
        case date, fundsArray, totalFunds
    }
}
```

- [ ] **Step 3: `Profile.swift` を作成**

```swift
import Foundation

struct Profile: Codable, Identifiable {
    let id: UUID
    let username: String?
    let fullName: String?
    let collectMethod: String?

    enum CodingKeys: String, CodingKey {
        case id, username
        case fullName = "full_name"
        case collectMethod = "collectMethod"
    }
}

enum UserRole: String, Comparable {
    case viewer, collecter, admin

    static func < (lhs: UserRole, rhs: UserRole) -> Bool {
        let order: [UserRole] = [.viewer, .collecter, .admin]
        return order.firstIndex(of: lhs)! < order.firstIndex(of: rhs)!
    }
}
```

- [ ] **Step 4: `Organization.swift` を作成**

```swift
import Foundation

struct Organization: Codable, Identifiable {
    let id: UUID
    let name: String
}

struct OrganizationMember: Codable, Identifiable {
    let id: UUID
    let userId: UUID
    let role: String
    let profile: Profile?

    enum CodingKeys: String, CodingKey {
        case id, role
        case userId = "user_id"
        case profile = "profiles"
    }

    var userRole: UserRole { UserRole(rawValue: role) ?? .viewer }
}
```

- [ ] **Step 5: `ActionMessage.swift` を作成**

```swift
import Foundation

struct ActionMessage: Codable, Identifiable {
    let id: Int
    let message: String?
    let date: Int64?
    let orgId: UUID?

    enum CodingKeys: String, CodingKey {
        case id, message, date
        case orgId = "org_id"
    }
}
```

- [ ] **Step 6: ビルド確認 (`Cmd+B`) してコミット**

```bash
git add Collecie/Models/DTO/
git commit -m "feat(ios): add DTO models for Supabase responses"
```

---

## Task 5: SwiftData モデル

**Files:**
- Create: `Collecie/Models/SwiftData/PendingCollect.swift`
- Create: `Collecie/Models/SwiftData/UserPreferences.swift`

- [ ] **Step 1: `PendingCollect.swift` を作成（Phase 2 で実装、今はスタブ）**

```swift
import SwiftData
import Foundation

@Model
final class PendingCollect {
    var id: UUID
    var storeId: String
    var storeName: String
    var date: Int64
    var fundsArrayData: Data
    var totalFunds: Int64
    var createdAt: Date
    var syncStatusRaw: String

    init(storeId: String, storeName: String, date: Int64,
         fundsArrayData: Data, totalFunds: Int64) {
        self.id = UUID()
        self.storeId = storeId
        self.storeName = storeName
        self.date = date
        self.fundsArrayData = fundsArrayData
        self.totalFunds = totalFunds
        self.createdAt = Date()
        self.syncStatusRaw = "pending"
    }

    enum SyncStatus: String { case pending, syncing, failed }
    var syncStatus: SyncStatus {
        get { SyncStatus(rawValue: syncStatusRaw) ?? .pending }
        set { syncStatusRaw = newValue.rawValue }
    }
}
```

- [ ] **Step 2: `UserPreferences.swift` を作成**

```swift
import SwiftData

@Model
final class UserPreferences {
    var collectMethod: String
    var isDarkMode: Bool

    init(collectMethod: String = "total", isDarkMode: Bool = false) {
        self.collectMethod = collectMethod
        self.isDarkMode = isDarkMode
    }
}
```

- [ ] **Step 3: `CollecieApp.swift` を更新して SwiftData container を設定**

```swift
import SwiftUI
import SwiftData

@main
struct CollecieApp: App {
    var body: some Scene {
        WindowGroup {
            AppRouter()
        }
        .modelContainer(for: [PendingCollect.self, UserPreferences.self])
    }
}
```

- [ ] **Step 4: ビルド確認 (`Cmd+B`) してコミット**

```bash
git add Collecie/Models/SwiftData/ Collecie/App/CollecieApp.swift
git commit -m "feat(ios): add SwiftData models"
```

---

## Task 6: Core Services

**Files:**
- Create: `Collecie/Services/SupabaseService.swift`
- Create: `Collecie/Services/NetworkMonitor.swift`
- Create: `Collecie/Services/AppError.swift`

- [ ] **Step 1: `AppError.swift` を作成**

```swift
import Foundation

enum AppError: LocalizedError {
    case notAuthenticated
    case notAuthorized
    case networkError(Error)
    case decodingError(Error)
    case unknown(Error)

    var errorDescription: String? {
        switch self {
        case .notAuthenticated:    return "ログインしてください"
        case .notAuthorized:       return "権限がありません"
        case .networkError(let e): return "通信エラー: \(e.localizedDescription)"
        case .decodingError:       return "データの読み込みに失敗しました"
        case .unknown(let e):      return e.localizedDescription
        }
    }
}
```

- [ ] **Step 2: `SupabaseService.swift` を作成**

```swift
import Supabase
import Foundation

final class SupabaseService {
    static let shared = SupabaseService()

    let client: SupabaseClient

    private init() {
        let urlString = Bundle.main.infoDictionary?["SUPABASE_URL"] as? String ?? ""
        let key = Bundle.main.infoDictionary?["SUPABASE_ANON_KEY"] as? String ?? ""
        client = SupabaseClient(
            supabaseURL: URL(string: urlString)!,
            supabaseKey: key
        )
    }
}
```

- [ ] **Step 3: `NetworkMonitor.swift` を作成**

```swift
import Network
import Observation

@Observable
final class NetworkMonitor {
    static let shared = NetworkMonitor()

    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "NetworkMonitor")

    var isConnected: Bool = true

    private init() {
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                self?.isConnected = path.status == .satisfied
            }
        }
        monitor.start(queue: queue)
    }
}
```

- [ ] **Step 4: ビルド確認 (`Cmd+B`) してコミット**

```bash
git add Collecie/Services/
git commit -m "feat(ios): add SupabaseService, NetworkMonitor, AppError"
```

---

## Task 7: AuthRepository + テスト

**Files:**
- Create: `Collecie/Auth/AuthRepository.swift`
- Create: `CollecieTests/Helpers/MockRepositories.swift`
- Create: `CollecieTests/Auth/AuthRepositoryTests.swift`

- [ ] **Step 1: テストを先に書く**

`CollecieTests/Auth/AuthRepositoryTests.swift`:
```swift
import XCTest
@testable import Collecie

final class AuthRepositoryTests: XCTestCase {

    func test_isLoggedIn_returnsFalseWhenNoSession() async {
        // AuthRepository はテスト環境では Supabase に接続しないため
        // 初期状態でセッションなし = false を期待
        let repo = AuthRepository()
        let result = await repo.isLoggedIn()
        XCTAssertFalse(result)
    }
}
```

- [ ] **Step 2: テストが失敗することを確認**

Xcode → `Cmd+U`（テスト実行）。`AuthRepository` が存在しないためコンパイルエラーになる。

- [ ] **Step 3: `AuthRepository.swift` を作成**

```swift
import Supabase
import Foundation

struct AuthRepository {
    private var client: SupabaseClient { SupabaseService.shared.client }

    func isLoggedIn() async -> Bool {
        (try? await client.auth.session) != nil
    }

    func signIn(email: String, password: String) async throws {
        try await client.auth.signIn(email: email, password: password)
    }

    func signUp(email: String, password: String) async throws {
        try await client.auth.signUp(email: email, password: password)
    }

    func sendPasswordReset(email: String) async throws {
        try await client.auth.resetPasswordForEmail(email)
    }

    func signOut() async throws {
        try await client.auth.signOut()
    }

    func currentUserId() async -> UUID? {
        try? await client.auth.user().id
    }

    func currentUserEmail() async -> String? {
        try? await client.auth.user().email
    }
}
```

- [ ] **Step 4: テストを再実行 (`Cmd+U`)、PASS することを確認**

- [ ] **Step 5: コミット**

```bash
git add Collecie/Auth/AuthRepository.swift CollecieTests/
git commit -m "feat(ios): add AuthRepository"
```

---

## Task 8: AuthState + AppRouter

**Files:**
- Create: `Collecie/Auth/AuthState.swift`
- Create: `Collecie/App/AppRouter.swift`

- [ ] **Step 1: テストを書く**

`CollecieTests/Auth/AuthRepositoryTests.swift` に追記:
```swift
func test_authState_initialIsLoadingTrue() {
    let state = AuthState()
    XCTAssertTrue(state.isLoading)
    XCTAssertNil(state.userId)
    XCTAssertEqual(state.userRole, .viewer)
}
```

- [ ] **Step 2: テストが失敗することを確認 (`Cmd+U`)**

- [ ] **Step 3: `AuthState.swift` を作成（ロール読み込みは Task 9 で追加）**

```swift
import Observation
import Supabase
import Foundation

@Observable
final class AuthState {
    var userId: UUID?
    var userEmail: String?
    var userRole: UserRole = .viewer
    var isLoading: Bool = true

    var isLoggedIn: Bool { userId != nil }

    private let authRepo = AuthRepository()

    init() {
        Task { await checkSession() }
    }

    func checkSession() async {
        isLoading = true
        defer { isLoading = false }
        userId = await authRepo.currentUserId()
        userEmail = await authRepo.currentUserEmail()
        // ロール読み込みは Task 9 で ProfileRepository 作成後に追加
    }

    func signIn(email: String, password: String) async throws {
        try await authRepo.signIn(email: email, password: password)
        userId = await authRepo.currentUserId()
        userEmail = await authRepo.currentUserEmail()
    }

    func signOut() async throws {
        try await authRepo.signOut()
        userId = nil
        userEmail = nil
        userRole = .viewer
        isLoading = false
    }
}
```

- [ ] **Step 4: `AppRouter.swift` を作成**

```swift
import SwiftUI

struct AppRouter: View {
    @State private var authState = AuthState()

    var body: some View {
        Group {
            if authState.isLoading {
                ProgressView("読み込み中...")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if authState.isLoggedIn {
                MainTabView()
                    .environment(authState)
            } else {
                LoginView()
                    .environment(authState)
            }
        }
    }
}
```

- [ ] **Step 5: テスト実行 (`Cmd+U`)、PASS を確認**

- [ ] **Step 6: コミット**

```bash
git add Collecie/Auth/AuthState.swift Collecie/App/AppRouter.swift
git commit -m "feat(ios): add AuthState and AppRouter"
```

---

## Task 9: ProfileRepository

`AuthState` が `getMyMemberRole()` を呼ぶため、先に ProfileRepository を作る。

**Files:**
- Create: `Collecie/Features/Settings/ProfileRepository.swift`
- Test: `CollecieTests/Helpers/MockRepositories.swift`

- [ ] **Step 1: `MockRepositories.swift` を作成**

```swift
@testable import Collecie

final class MockProfileRepository: ProfileRepositoryProtocol {
    var memberRole: String = "viewer"
    var profile: Profile?

    func getMyMemberRole() async throws -> String { memberRole }
    func getProfile() async throws -> Profile {
        profile ?? Profile(id: UUID(), username: "test", fullName: nil, collectMethod: nil)
    }
    func updateProfile(username: String, fullName: String) async throws {}
    func setCollectMethod(_ method: String) async throws {}
}
```

- [ ] **Step 2: `ProfileRepository.swift` を作成**

```swift
import Supabase
import Foundation

protocol ProfileRepositoryProtocol {
    func getMyMemberRole() async throws -> String
    func getProfile() async throws -> Profile
    func updateProfile(username: String, fullName: String) async throws
    func setCollectMethod(_ method: String) async throws
}

struct ProfileRepository: ProfileRepositoryProtocol {
    private var db: PostgrestQueryBuilder { SupabaseService.shared.client.from("organization_members") }
    private var profileDb: PostgrestQueryBuilder { SupabaseService.shared.client.from("profiles") }

    func getMyMemberRole() async throws -> String {
        struct RoleRow: Decodable { let role: String }
        let row: RoleRow = try await db
            .select("role")
            .limit(1)
            .single()
            .execute()
            .value
        return row.role
    }

    func getProfile() async throws -> Profile {
        guard let uid = await AuthRepository().currentUserId() else {
            throw AppError.notAuthenticated
        }
        return try await profileDb
            .select("id, username, full_name, collectMethod")
            .eq("id", value: uid.uuidString)
            .single()
            .execute()
            .value
    }

    func updateProfile(username: String, fullName: String) async throws {
        guard let uid = await AuthRepository().currentUserId() else {
            throw AppError.notAuthenticated
        }
        try await profileDb
            .update(["username": username, "full_name": fullName])
            .eq("id", value: uid.uuidString)
            .execute()
    }

    func setCollectMethod(_ method: String) async throws {
        guard let uid = await AuthRepository().currentUserId() else {
            throw AppError.notAuthenticated
        }
        try await profileDb
            .update(["collectMethod": method])
            .eq("id", value: uid.uuidString)
            .execute()
    }
}
```

- [ ] **Step 3: `AuthState.swift` を更新してロール読み込みを追加**

`checkSession()` と `signIn()` を以下に差し替える:
```swift
func checkSession() async {
    isLoading = true
    defer { isLoading = false }
    userId = await authRepo.currentUserId()
    userEmail = await authRepo.currentUserEmail()
    if userId != nil {
        let role = try? await ProfileRepository().getMyMemberRole()
        userRole = UserRole(rawValue: role ?? "viewer") ?? .viewer
    }
}

func signIn(email: String, password: String) async throws {
    try await authRepo.signIn(email: email, password: password)
    userId = await authRepo.currentUserId()
    userEmail = await authRepo.currentUserEmail()
    let role = try? await ProfileRepository().getMyMemberRole()
    userRole = UserRole(rawValue: role ?? "viewer") ?? .viewer
}
```

- [ ] **Step 4: ビルド確認 (`Cmd+B`) してコミット**

```bash
git add Collecie/Features/Settings/ProfileRepository.swift \
        Collecie/Auth/AuthState.swift \
        CollecieTests/Helpers/
git commit -m "feat(ios): add ProfileRepository and wire role loading into AuthState"
```

---

## Task 10: ログイン / サインアップ / パスワードリセット UI

**Files:**
- Create: `Collecie/Auth/LoginView.swift`
- Create: `Collecie/Auth/SignupView.swift`
- Create: `Collecie/Auth/ForgotPasswordView.swift`
- Create: `Collecie/Components/ErrorBanner.swift`

- [ ] **Step 1: `ErrorBanner.swift` を作成**

```swift
import SwiftUI

struct ErrorBanner: View {
    let message: String

    var body: some View {
        HStack {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(.red)
            Text(message)
                .font(.footnote)
        }
        .padding(10)
        .background(Color.red.opacity(0.1))
        .cornerRadius(8)
    }
}
```

- [ ] **Step 2: `LoginView.swift` を作成**

```swift
import SwiftUI

struct LoginView: View {
    @Environment(AuthState.self) private var authState
    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showSignup = false
    @State private var showForgotPassword = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Text("Collecie")
                    .font(.largeTitle.bold())
                    .foregroundStyle(Color(red: 0.086, green: 0.369, blue: 0.459))

                VStack(spacing: 12) {
                    TextField("メールアドレス", text: $email)
                        .textFieldStyle(.roundedBorder)
                        .keyboardType(.emailAddress)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)

                    SecureField("パスワード", text: $password)
                        .textFieldStyle(.roundedBorder)
                }

                if let msg = errorMessage {
                    ErrorBanner(message: msg)
                }

                Button {
                    Task { await login() }
                } label: {
                    Group {
                        if isLoading {
                            ProgressView()
                        } else {
                            Text("ログイン")
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color(red: 0.033, green: 0.565, blue: 0.698))
                    .foregroundStyle(.white)
                    .cornerRadius(10)
                }
                .disabled(isLoading)

                HStack {
                    Button("アカウント作成") { showSignup = true }
                    Spacer()
                    Button("パスワードを忘れた") { showForgotPassword = true }
                }
                .font(.footnote)
            }
            .padding(24)
            .sheet(isPresented: $showSignup) { SignupView() }
            .sheet(isPresented: $showForgotPassword) { ForgotPasswordView() }
        }
    }

    private func login() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            try await authState.signIn(email: email, password: password)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
```

- [ ] **Step 3: `SignupView.swift` を作成**

```swift
import SwiftUI

struct SignupView: View {
    @Environment(AuthState.self) private var authState
    @Environment(\.dismiss) private var dismiss
    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var didSignUp = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Text("アカウント作成").font(.title2.bold())

                TextField("メールアドレス", text: $email)
                    .textFieldStyle(.roundedBorder)
                    .keyboardType(.emailAddress)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.never)

                SecureField("パスワード（8文字以上）", text: $password)
                    .textFieldStyle(.roundedBorder)

                if let msg = errorMessage { ErrorBanner(message: msg) }

                if didSignUp {
                    Text("確認メールを送信しました。メールを確認してログインしてください。")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }

                Button {
                    Task { await signUp() }
                } label: {
                    Group {
                        if isLoading { ProgressView() } else { Text("登録") }
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color(red: 0.033, green: 0.565, blue: 0.698))
                    .foregroundStyle(.white)
                    .cornerRadius(10)
                }
                .disabled(isLoading || didSignUp)
            }
            .padding(24)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("閉じる") { dismiss() }
                }
            }
        }
    }

    private func signUp() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            let repo = AuthRepository()
            try await repo.signUp(email: email, password: password)
            didSignUp = true
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
```

- [ ] **Step 4: `ForgotPasswordView.swift` を作成**

```swift
import SwiftUI

struct ForgotPasswordView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var email = ""
    @State private var isLoading = false
    @State private var didSend = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Text("パスワードリセット").font(.title2.bold())
                Text("登録済みのメールアドレスにリセットリンクを送ります")
                    .font(.footnote).foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)

                TextField("メールアドレス", text: $email)
                    .textFieldStyle(.roundedBorder)
                    .keyboardType(.emailAddress)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.never)

                if let msg = errorMessage { ErrorBanner(message: msg) }
                if didSend {
                    Text("送信しました。メールを確認してください。")
                        .font(.footnote).foregroundStyle(.green)
                }

                Button {
                    Task { await send() }
                } label: {
                    Group {
                        if isLoading { ProgressView() } else { Text("送信") }
                    }
                    .frame(maxWidth: .infinity).padding()
                    .background(Color(red: 0.033, green: 0.565, blue: 0.698))
                    .foregroundStyle(.white).cornerRadius(10)
                }
                .disabled(isLoading || didSend)
            }
            .padding(24)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button("閉じる") { dismiss() } } }
        }
    }

    private func send() async {
        isLoading = true; errorMessage = nil; defer { isLoading = false }
        do {
            try await AuthRepository().sendPasswordReset(email: email)
            didSend = true
        } catch { errorMessage = error.localizedDescription }
    }
}
```

- [ ] **Step 5: Simulator で起動し、ログイン画面が表示されることを確認 (`Cmd+R`)**

- [ ] **Step 6: コミット**

```bash
git add Collecie/Auth/ Collecie/Components/ErrorBanner.swift
git commit -m "feat(ios): add login, signup, forgot password views"
```

---

## Task 11: メインタブバー + RoleBasedView

**Files:**
- Create: `Collecie/Navigation/MainTabView.swift`
- Create: `Collecie/Components/RoleBasedView.swift`

- [ ] **Step 1: `RoleBasedView.swift` を作成**

```swift
import SwiftUI

struct RoleBasedView<Content: View>: View {
    let minimumRole: UserRole
    @Environment(AuthState.self) private var authState
    let content: () -> Content

    init(minimumRole: UserRole, @ViewBuilder content: @escaping () -> Content) {
        self.minimumRole = minimumRole
        self.content = content
    }

    var body: some View {
        if authState.userRole >= minimumRole {
            content()
        }
    }
}
```

- [ ] **Step 2: `MainTabView.swift` を作成**

```swift
import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            HomeView()
                .tabItem { Label("ホーム", systemImage: "house") }

            StoreListView()
                .tabItem { Label("店舗", systemImage: "building.2") }

            CollectListView()
                .tabItem { Label("集金", systemImage: "yensign.circle") }

            SettingsView()
                .tabItem { Label("設定", systemImage: "gear") }
        }
        .tint(Color(red: 0.033, green: 0.565, blue: 0.698))
    }
}
```

- [ ] **Step 3: 各 Feature の空 View を作成（タブがクラッシュしないようにスタブ）**

`Collecie/Features/Home/HomeView.swift`:
```swift
import SwiftUI
struct HomeView: View {
    var body: some View { Text("ホーム（実装中）") }
}
```

`Collecie/Features/Store/StoreListView.swift`:
```swift
import SwiftUI
struct StoreListView: View {
    var body: some View { Text("店舗一覧（実装中）") }
}
```

`Collecie/Features/Collect/CollectListView.swift`:
```swift
import SwiftUI
struct CollectListView: View {
    var body: some View { Text("集金一覧（実装中）") }
}
```

`Collecie/Features/Settings/SettingsView.swift`:
```swift
import SwiftUI
struct SettingsView: View {
    var body: some View { Text("設定（実装中）") }
}
```

- [ ] **Step 4: Simulator でログイン後にタブバーが表示されることを確認**

（Supabase に実際のアカウントを作って試す）

- [ ] **Step 5: コミット**

```bash
git add Collecie/Navigation/ Collecie/Components/RoleBasedView.swift Collecie/Features/
git commit -m "feat(ios): add tab bar navigation shell with stub views"
```

---

## Task 12: StoreRepository + テスト

**Files:**
- Create: `Collecie/Features/Store/StoreRepository.swift`
- Modify: `CollecieTests/Helpers/MockRepositories.swift`
- Create: `CollecieTests/Features/Store/StoreListViewModelTests.swift`

- [ ] **Step 1: テストを書く**

`CollecieTests/Features/Store/StoreListViewModelTests.swift`:
```swift
import XCTest
@testable import Collecie

final class StoreListViewModelTests: XCTestCase {

    func test_loadStores_populatesStores() async throws {
        let mockRepo = MockStoreRepository()
        let testStore = Store(
            id: UUID(), store: "テスト店舗", location: "東京都",
            description: "テスト", machines: [], images: [],
            owner: UUID(), organizationId: nil
        )
        mockRepo.stores = [testStore]

        let vm = StoreListViewModel(repository: mockRepo)
        await vm.loadStores()

        XCTAssertEqual(vm.stores.count, 1)
        XCTAssertEqual(vm.stores.first?.store, "テスト店舗")
        XCTAssertFalse(vm.isLoading)
    }

    func test_loadStores_setsErrorOnFailure() async {
        let mockRepo = MockStoreRepository()
        mockRepo.shouldThrow = true

        let vm = StoreListViewModel(repository: mockRepo)
        await vm.loadStores()

        XCTAssertNotNil(vm.errorMessage)
        XCTAssertTrue(vm.stores.isEmpty)
    }
}
```

- [ ] **Step 2: MockStoreRepository を `MockRepositories.swift` に追加**

```swift
import Foundation
@testable import Collecie

final class MockStoreRepository: StoreRepositoryProtocol {
    var stores: [Store] = []
    var shouldThrow = false

    func getStores() async throws -> [Store] {
        if shouldThrow { throw AppError.networkError(NSError(domain: "", code: -1)) }
        return stores
    }
    func getStore(id: UUID) async throws -> Store {
        guard let s = stores.first(where: { $0.id == id }) else {
            throw AppError.unknown(NSError(domain: "", code: 404))
        }
        return s
    }
    func createStore(_ store: NewStore) async throws {}
    func updateStore(id: UUID, _ store: NewStore) async throws {}
    func deleteStore(id: UUID) async throws {}
}
```

- [ ] **Step 3: テスト実行 (`Cmd+U`) → コンパイルエラーになることを確認**

- [ ] **Step 4: `StoreRepository.swift` を作成**

```swift
import Supabase
import Foundation

protocol StoreRepositoryProtocol {
    func getStores() async throws -> [Store]
    func getStore(id: UUID) async throws -> Store
    func createStore(_ store: NewStore) async throws
    func updateStore(id: UUID, _ store: NewStore) async throws
    func deleteStore(id: UUID) async throws
}

struct StoreRepository: StoreRepositoryProtocol {
    private var db: PostgrestQueryBuilder {
        SupabaseService.shared.client.from("laundry_store")
    }

    func getStores() async throws -> [Store] {
        try await db.select().execute().value
    }

    func getStore(id: UUID) async throws -> Store {
        try await db.select().eq("id", value: id.uuidString).single().execute().value
    }

    func createStore(_ store: NewStore) async throws {
        try await db.insert(store).execute()
    }

    func updateStore(id: UUID, _ store: NewStore) async throws {
        try await db.update(store).eq("id", value: id.uuidString).execute()
    }

    func deleteStore(id: UUID) async throws {
        try await db.delete().eq("id", value: id.uuidString).execute()
    }
}
```

- [ ] **Step 5: `StoreListViewModel.swift` を作成（テストが参照するため）**

`Collecie/Features/Store/StoreListViewModel.swift`:
```swift
import Observation

@Observable
final class StoreListViewModel {
    var stores: [Store] = []
    var isLoading = false
    var errorMessage: String?

    private let repository: any StoreRepositoryProtocol

    init(repository: any StoreRepositoryProtocol = StoreRepository()) {
        self.repository = repository
    }

    func loadStores() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            stores = try await repository.getStores()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
```

- [ ] **Step 6: テスト実行 (`Cmd+U`) → PASS を確認**

- [ ] **Step 7: コミット**

```bash
git add Collecie/Features/Store/StoreRepository.swift \
        Collecie/Features/Store/StoreListViewModel.swift \
        CollecieTests/
git commit -m "feat(ios): add StoreRepository and StoreListViewModel with tests"
```

---

## Task 13: StoreListView + StoreDetailView

**Files:**
- Modify: `Collecie/Features/Store/StoreListView.swift`
- Create: `Collecie/Features/Store/StoreDetailView.swift`
- Create: `Collecie/Features/Store/StoreDetailViewModel.swift`

- [ ] **Step 1: `StoreListView.swift` を実装**

```swift
import SwiftUI

struct StoreListView: View {
    @Environment(AuthState.self) private var authState
    @State private var vm = StoreListViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if vm.isLoading {
                    ProgressView()
                } else if vm.stores.isEmpty {
                    ContentUnavailableView("店舗がありません", systemImage: "building.2")
                } else {
                    List(vm.stores) { store in
                        NavigationLink(destination: StoreDetailView(store: store)) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(store.store).font(.headline)
                                Text(store.location).font(.caption).foregroundStyle(.secondary)
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }
            }
            .navigationTitle("店舗一覧")
            .toolbar {
                RoleBasedView(minimumRole: .admin) {
                    NavigationLink(destination: StoreFormView(mode: .create)) {
                        Image(systemName: "plus")
                    }
                }
            }
            .task { await vm.loadStores() }
            .refreshable { await vm.loadStores() }
            .alert("エラー", isPresented: .constant(vm.errorMessage != nil)) {
                Button("OK") { vm.errorMessage = nil }
            } message: { Text(vm.errorMessage ?? "") }
        }
    }
}
```

- [ ] **Step 2: `StoreDetailViewModel.swift` を作成**

```swift
import Observation

@Observable
final class StoreDetailViewModel {
    var store: Store
    var isDeleting = false
    var errorMessage: String?

    private let repository: any StoreRepositoryProtocol

    init(store: Store, repository: any StoreRepositoryProtocol = StoreRepository()) {
        self.store = store
        self.repository = repository
    }

    func delete() async throws {
        isDeleting = true
        defer { isDeleting = false }
        try await repository.deleteStore(id: store.id)
    }
}
```

- [ ] **Step 3: `StoreDetailView.swift` を作成**

```swift
import SwiftUI

struct StoreDetailView: View {
    @Environment(AuthState.self) private var authState
    @Environment(\.dismiss) private var dismiss
    @State private var vm: StoreDetailViewModel

    init(store: Store) {
        _vm = State(initialValue: StoreDetailViewModel(store: store))
    }

    var body: some View {
        List {
            Section("基本情報") {
                LabeledContent("店舗名", value: vm.store.store)
                LabeledContent("住所", value: vm.store.location)
                LabeledContent("説明", value: vm.store.description)
            }

            Section("機器") {
                if vm.store.machines.isEmpty {
                    Text("機器未登録").foregroundStyle(.secondary)
                } else {
                    ForEach(vm.store.machines) { machine in
                        HStack {
                            Text(machine.name)
                            Spacer()
                            if machine.hasFault {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .foregroundStyle(.red)
                            }
                        }
                    }
                }
            }

            RoleBasedView(minimumRole: .admin) {
                Section {
                    Button("削除", role: .destructive) {
                        Task {
                            try? await vm.delete()
                            dismiss()
                        }
                    }
                }
            }
        }
        .navigationTitle(vm.store.store)
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            RoleBasedView(minimumRole: .admin) {
                NavigationLink(destination: StoreFormView(mode: .edit(vm.store))) {
                    Text("編集")
                }
            }
        }
    }
}
```

- [ ] **Step 4: Simulator で店舗一覧 → 詳細の遷移を確認**

- [ ] **Step 5: コミット**

```bash
git add Collecie/Features/Store/
git commit -m "feat(ios): add StoreListView and StoreDetailView"
```

---

## Task 14: StoreFormView（新規・編集共用）

**Files:**
- Create: `Collecie/Features/Store/StoreFormView.swift`
- Create: `Collecie/Features/Store/StoreFormViewModel.swift`

- [ ] **Step 1: `StoreFormViewModel.swift` を作成**

```swift
import Observation
import Foundation

enum StoreFormMode {
    case create
    case edit(Store)
}

@Observable
final class StoreFormViewModel {
    var name: String = ""
    var location: String = ""
    var description: String = ""
    var isLoading = false
    var errorMessage: String?

    let mode: StoreFormMode
    private let repository: any StoreRepositoryProtocol

    init(mode: StoreFormMode, repository: any StoreRepositoryProtocol = StoreRepository()) {
        self.mode = mode
        self.repository = repository
        if case .edit(let store) = mode {
            name = store.store
            location = store.location
            description = store.description
        }
    }

    var title: String {
        switch mode { case .create: "店舗追加"; case .edit: "店舗編集" }
    }

    func save() async throws {
        isLoading = true
        defer { isLoading = false }
        let newStore = NewStore(store: name, location: location,
                               description: description, machines: [], organizationId: nil)
        switch mode {
        case .create:
            try await repository.createStore(newStore)
        case .edit(let store):
            try await repository.updateStore(id: store.id, newStore)
        }
    }
}
```

- [ ] **Step 2: `StoreFormView.swift` を作成**

```swift
import SwiftUI

struct StoreFormView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var vm: StoreFormViewModel

    init(mode: StoreFormMode) {
        _vm = State(initialValue: StoreFormViewModel(mode: mode))
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("基本情報") {
                    TextField("店舗名", text: $vm.name)
                    TextField("住所", text: $vm.location)
                    TextField("説明", text: $vm.description)
                }

                if let msg = vm.errorMessage {
                    Section { ErrorBanner(message: msg) }
                }
            }
            .navigationTitle(vm.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("キャンセル") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("保存") {
                        Task {
                            do {
                                try await vm.save()
                                dismiss()
                            } catch {
                                vm.errorMessage = error.localizedDescription
                            }
                        }
                    }
                    .disabled(vm.name.isEmpty || vm.isLoading)
                }
            }
        }
    }
}
```

- [ ] **Step 3: Simulator で店舗の新規作成・編集を確認**

- [ ] **Step 4: コミット**

```bash
git add Collecie/Features/Store/StoreFormView.swift \
        Collecie/Features/Store/StoreFormViewModel.swift
git commit -m "feat(ios): add StoreFormView for create and edit"
```

---

## Task 15: CollectRepository + テスト

**Files:**
- Create: `Collecie/Features/Collect/CollectRepository.swift`
- Modify: `CollecieTests/Helpers/MockRepositories.swift`
- Create: `CollecieTests/Features/Collect/CollectNewViewModelTests.swift`

- [ ] **Step 1: テストを書く**

`CollecieTests/Features/Collect/CollectNewViewModelTests.swift`:
```swift
import XCTest
@testable import Collecie

final class CollectNewViewModelTests: XCTestCase {

    func test_totalFunds_sumsFundsArray() {
        let vm = CollectNewViewModel(
            store: Store(id: UUID(), store: "A", location: "", description: "",
                        machines: [
                            Machine(id: "w1", name: "洗濯機1", status: "normal", hasFault: false),
                            Machine(id: "d1", name: "乾燥機1", status: "normal", hasFault: false)
                        ], images: [], owner: UUID(), organizationId: nil),
            repository: MockCollectRepository()
        )
        vm.machineAmounts["w1"] = 1000
        vm.machineAmounts["d1"] = 2000

        XCTAssertEqual(vm.calculatedTotal, 3000)
    }

    func test_save_callsRepository() async throws {
        let mockRepo = MockCollectRepository()
        let vm = CollectNewViewModel(
            store: Store(id: UUID(), store: "B", location: "", description: "",
                        machines: [], images: [], owner: UUID(), organizationId: nil),
            repository: mockRepo
        )
        vm.totalAmount = 5000
        vm.collectMethod = .total

        try await vm.save()

        XCTAssertTrue(mockRepo.didCreate)
    }
}
```

- [ ] **Step 2: `MockCollectRepository` を `MockRepositories.swift` に追加**

```swift
final class MockCollectRepository: CollectRepositoryProtocol {
    var funds: [CollectFund] = []
    var didCreate = false
    var shouldThrow = false

    func getFunds(storeId: UUID) async throws -> [CollectFund] {
        if shouldThrow { throw AppError.networkError(NSError(domain: "", code: -1)) }
        return funds
    }
    func createFund(_ fund: NewCollectFund) async throws {
        didCreate = true
    }
    func updateFund(id: UUID, fundsArray: [FundsItem], totalFunds: Int64) async throws {}
    func deleteFund(id: UUID) async throws {}
}
```

- [ ] **Step 3: テスト実行 → コンパイルエラーを確認**

- [ ] **Step 4: `CollectRepository.swift` を作成**

```swift
import Supabase
import Foundation

protocol CollectRepositoryProtocol {
    func getFunds(storeId: UUID) async throws -> [CollectFund]
    func createFund(_ fund: NewCollectFund) async throws
    func updateFund(id: UUID, fundsArray: [FundsItem], totalFunds: Int64) async throws
    func deleteFund(id: UUID) async throws
}

struct CollectRepository: CollectRepositoryProtocol {
    private var db: PostgrestQueryBuilder {
        SupabaseService.shared.client.from("collect_funds")
    }

    func getFunds(storeId: UUID) async throws -> [CollectFund] {
        try await db
            .select()
            .eq("laundryId", value: storeId.uuidString)
            .order("date", ascending: false)
            .execute()
            .value
    }

    func createFund(_ fund: NewCollectFund) async throws {
        try await db.insert(fund).execute()
    }

    func updateFund(id: UUID, fundsArray: [FundsItem], totalFunds: Int64) async throws {
        struct UpdateBody: Encodable {
            let fundsArray: [FundsItem]
            let totalFunds: Int64
        }
        try await db
            .update(UpdateBody(fundsArray: fundsArray, totalFunds: totalFunds))
            .eq("id", value: id.uuidString)
            .execute()
    }

    func deleteFund(id: UUID) async throws {
        try await db.delete().eq("id", value: id.uuidString).execute()
    }
}
```

- [ ] **Step 5: `CollectNewViewModel.swift` を作成**

```swift
import Observation
import Foundation

enum CollectMethod: String { case machines, total }

@Observable
final class CollectNewViewModel {
    var store: Store
    var collectMethod: CollectMethod = .total
    var machineAmounts: [String: Int64] = [:]
    var totalAmount: Int64 = 0
    var date: Date = Date()
    var isLoading = false
    var errorMessage: String?

    private let repository: any CollectRepositoryProtocol

    init(store: Store, repository: any CollectRepositoryProtocol = CollectRepository()) {
        self.store = store
        self.repository = repository
        store.machines.forEach { machineAmounts[$0.id] = 0 }
    }

    var calculatedTotal: Int64 {
        machineAmounts.values.reduce(0, +)
    }

    func save() async throws {
        isLoading = true
        defer { isLoading = false }

        let fundsArray: [FundsItem]
        let total: Int64

        switch collectMethod {
        case .machines:
            fundsArray = store.machines.compactMap { machine in
                guard let amount = machineAmounts[machine.id], amount > 0 else { return nil }
                return FundsItem(machineId: machine.id, machineName: machine.name, amount: amount)
            }
            total = calculatedTotal
        case .total:
            fundsArray = []
            total = totalAmount
        }

        let fund = NewCollectFund(
            laundryId: store.id,
            laundryName: store.store,
            date: Int64(date.timeIntervalSince1970 * 1000),
            fundsArray: fundsArray,
            totalFunds: total
        )
        try await repository.createFund(fund)
    }
}
```

- [ ] **Step 6: テスト実行 (`Cmd+U`) → PASS を確認**

- [ ] **Step 7: コミット**

```bash
git add Collecie/Features/Collect/ CollecieTests/
git commit -m "feat(ios): add CollectRepository and CollectNewViewModel with tests"
```

---

## Task 16: CollectListView + CollectNewView

**Files:**
- Modify: `Collecie/Features/Collect/CollectListView.swift`
- Create: `Collecie/Features/Collect/CollectListViewModel.swift`
- Create: `Collecie/Features/Collect/CollectNewView.swift`
- Create: `Collecie/Features/Collect/CollectEditView.swift`

- [ ] **Step 1: `CollectListViewModel.swift` を作成**

```swift
import Observation

@Observable
final class CollectListViewModel {
    var funds: [CollectFund] = []
    var isLoading = false
    var errorMessage: String?
    var selectedStoreId: UUID?

    private let repository: any CollectRepositoryProtocol

    init(repository: any CollectRepositoryProtocol = CollectRepository()) {
        self.repository = repository
    }

    func loadFunds(storeId: UUID) async {
        selectedStoreId = storeId
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            funds = try await repository.getFunds(storeId: storeId)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
```

- [ ] **Step 2: `CollectListView.swift` を実装**

```swift
import SwiftUI

struct CollectListView: View {
    let store: Store
    @State private var vm = CollectListViewModel()
    @State private var showNewCollect = false

    var body: some View {
        Group {
            if vm.isLoading {
                ProgressView()
            } else if vm.funds.isEmpty {
                ContentUnavailableView("集金データがありません", systemImage: "yensign.circle")
            } else {
                List(vm.funds) { fund in
                    NavigationLink(destination: CollectEditView(fund: fund, store: store)) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(formatDate(fund.date)).font(.subheadline)
                            Text("¥\(fund.totalFunds.formatted())").font(.headline)
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
        }
        .navigationTitle("集金記録")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    showNewCollect = true
                } label: {
                    Image(systemName: "plus")
                }
            }
        }
        .sheet(isPresented: $showNewCollect) {
            CollectNewView(store: store) {
                Task { await vm.loadFunds(storeId: store.id) }
            }
        }
        .task { await vm.loadFunds(storeId: store.id) }
        .refreshable { await vm.loadFunds(storeId: store.id) }
    }

    private func formatDate(_ epoch: Int64) -> String {
        let date = Date(timeIntervalSince1970: Double(epoch) / 1000)
        let f = DateFormatter()
        f.dateStyle = .medium
        return f.string(from: date)
    }
}
```

- [ ] **Step 3: `CollectNewView.swift` を作成**

```swift
import SwiftUI

struct CollectNewView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var vm: CollectNewViewModel
    let onSaved: () -> Void

    init(store: Store, onSaved: @escaping () -> Void) {
        _vm = State(initialValue: CollectNewViewModel(store: store))
        self.onSaved = onSaved
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("集金日") {
                    DatePicker("日付", selection: $vm.date, displayedComponents: .date)
                }

                Section("入力方法") {
                    Picker("集金方法", selection: $vm.collectMethod) {
                        Text("機械別").tag(CollectMethod.machines)
                        Text("合計").tag(CollectMethod.total)
                    }
                    .pickerStyle(.segmented)
                }

                if vm.collectMethod == .machines {
                    Section("機械別金額") {
                        ForEach(vm.store.machines) { machine in
                            HStack {
                                Text(machine.name)
                                Spacer()
                                TextField("0", value: Binding(
                                    get: { vm.machineAmounts[machine.id] ?? 0 },
                                    set: { vm.machineAmounts[machine.id] = $0 }
                                ), format: .number)
                                .keyboardType(.numberPad)
                                .multilineTextAlignment(.trailing)
                                .frame(width: 100)
                                Text("円")
                            }
                        }
                        LabeledContent("合計", value: "¥\(vm.calculatedTotal.formatted())")
                            .bold()
                    }
                } else {
                    Section("合計金額") {
                        HStack {
                            TextField("0", value: $vm.totalAmount, format: .number)
                                .keyboardType(.numberPad)
                            Text("円")
                        }
                    }
                }

                if let msg = vm.errorMessage {
                    Section { ErrorBanner(message: msg) }
                }
            }
            .navigationTitle("集金登録")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("キャンセル") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("保存") {
                        Task {
                            do {
                                try await vm.save()
                                onSaved()
                                dismiss()
                            } catch {
                                vm.errorMessage = error.localizedDescription
                            }
                        }
                    }
                    .disabled(vm.isLoading)
                }
            }
        }
    }
}
```

- [ ] **Step 4: `CollectEditView.swift` を作成（簡易版: 合計金額のみ編集）**

```swift
import SwiftUI

struct CollectEditView: View {
    @Environment(\.dismiss) private var dismiss
    let fund: CollectFund
    let store: Store
    @State private var totalAmount: Int64
    @State private var isLoading = false
    @State private var errorMessage: String?

    private let repository: any CollectRepositoryProtocol = CollectRepository()

    init(fund: CollectFund, store: Store) {
        self.fund = fund
        self.store = store
        _totalAmount = State(initialValue: fund.totalFunds)
    }

    var body: some View {
        Form {
            Section("合計金額") {
                HStack {
                    TextField("0", value: $totalAmount, format: .number)
                        .keyboardType(.numberPad)
                    Text("円")
                }
            }

            Section {
                Button("削除", role: .destructive) {
                    Task {
                        do {
                            try await repository.deleteFund(id: fund.id)
                            dismiss()
                        } catch {
                            errorMessage = error.localizedDescription
                        }
                    }
                }
            }

            if let msg = errorMessage { Section { ErrorBanner(message: msg) } }
        }
        .navigationTitle("集金編集")
        .toolbar {
            ToolbarItem(placement: .confirmationAction) {
                Button("保存") {
                    Task {
                        do {
                            try await repository.updateFund(
                                id: fund.id,
                                fundsArray: fund.fundsArray ?? [],
                                totalFunds: totalAmount
                            )
                            dismiss()
                        } catch {
                            errorMessage = error.localizedDescription
                        }
                    }
                }
            }
        }
    }
}
```

- [ ] **Step 5: `StoreDetailView` に集金タブを追加**

`StoreDetailView.swift` の `List` の中に追加:
```swift
Section {
    NavigationLink("集金記録", destination: CollectListView(store: vm.store))
}
```

- [ ] **Step 6: Simulator で集金の登録・編集を確認**

- [ ] **Step 7: コミット**

```bash
git add Collecie/Features/Collect/
git commit -m "feat(ios): add CollectListView, CollectNewView, CollectEditView"
```

---

## Task 17: HomeView

**Files:**
- Modify: `Collecie/Features/Home/HomeView.swift`
- Create: `Collecie/Features/Home/HomeViewModel.swift`

- [ ] **Step 1: `HomeViewModel.swift` を作成**

```swift
import Observation
import Foundation

@Observable
final class HomeViewModel {
    var monthlyTotal: Int64 = 0
    var recentFunds: [CollectFund] = []
    var isLoading = false
    var errorMessage: String?

    private let collectRepository: any CollectRepositoryProtocol
    private let storeRepository: any StoreRepositoryProtocol

    init(
        collectRepository: any CollectRepositoryProtocol = CollectRepository(),
        storeRepository: any StoreRepositoryProtocol = StoreRepository()
    ) {
        self.collectRepository = collectRepository
        self.storeRepository = storeRepository
    }

    func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            let stores = try await storeRepository.getStores()
            var total: Int64 = 0
            let now = Date()
            let calendar = Calendar.current
            let startOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: now))!
            let startEpoch = Int64(startOfMonth.timeIntervalSince1970 * 1000)

            for store in stores {
                let funds = try await collectRepository.getFunds(storeId: store.id)
                let thisMonth = funds.filter { $0.date >= startEpoch }
                total += thisMonth.reduce(0) { $0 + $1.totalFunds }
            }
            monthlyTotal = total
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
```

- [ ] **Step 2: `HomeView.swift` を実装**

```swift
import SwiftUI

struct HomeView: View {
    @State private var vm = HomeViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // 当月集金合計カード
                    VStack(spacing: 8) {
                        Text("今月の集金合計")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        Text("¥\(vm.monthlyTotal.formatted())")
                            .font(.system(size: 36, weight: .bold, design: .monospaced))
                            .foregroundStyle(Color(red: 0.086, green: 0.369, blue: 0.459))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(24)
                    .background(
                        LinearGradient(
                            colors: [Color(red: 0.055, green: 0.455, blue: 0.565),
                                     Color(red: 0.033, green: 0.565, blue: 0.698)],
                            startPoint: .topLeading, endPoint: .bottomTrailing
                        )
                    )
                    .foregroundStyle(.white)
                    .cornerRadius(16)
                    .padding(.horizontal)

                    if let msg = vm.errorMessage {
                        ErrorBanner(message: msg).padding(.horizontal)
                    }
                }
            }
            .navigationTitle("ホーム")
            .task { await vm.load() }
            .refreshable { await vm.load() }
        }
    }
}
```

- [ ] **Step 3: Simulator でホーム画面に当月合計が表示されることを確認**

- [ ] **Step 4: コミット**

```bash
git add Collecie/Features/Home/
git commit -m "feat(ios): add HomeView with monthly total"
```

---

## Task 18: SettingsView

**Files:**
- Modify: `Collecie/Features/Settings/SettingsView.swift`
- Create: `Collecie/Features/Settings/AccountEditView.swift`

- [ ] **Step 1: `SettingsView.swift` を実装**

```swift
import SwiftUI

struct SettingsView: View {
    @Environment(AuthState.self) private var authState
    @State private var profile: Profile?
    @State private var isLoading = false
    @State private var showAccountEdit = false
    @State private var errorMessage: String?

    private let profileRepo = ProfileRepository()

    var body: some View {
        NavigationStack {
            Form {
                Section("アカウント") {
                    if let p = profile {
                        LabeledContent("ユーザー名", value: p.username ?? "未設定")
                        LabeledContent("メール", value: authState.userEmail ?? "")
                        LabeledContent("ロール", value: authState.userRole.rawValue)
                    } else {
                        ProgressView()
                    }
                    Button("プロフィール編集") { showAccountEdit = true }
                }

                Section("集金方法") {
                    Picker("集金方法", selection: Binding(
                        get: { profile?.collectMethod ?? "total" },
                        set: { method in
                            Task { try? await profileRepo.setCollectMethod(method) }
                        }
                    )) {
                        Text("機械別").tag("machines")
                        Text("合計").tag("total")
                    }
                }

                Section {
                    Button("ログアウト", role: .destructive) {
                        Task { try? await authState.signOut() }
                    }
                }
            }
            .navigationTitle("設定")
            .task { await loadProfile() }
            .sheet(isPresented: $showAccountEdit) {
                if let p = profile {
                    AccountEditView(profile: p) { await loadProfile() }
                }
            }
        }
    }

    private func loadProfile() async {
        profile = try? await profileRepo.getProfile()
    }
}
```

- [ ] **Step 2: `AccountEditView.swift` を作成**

```swift
import SwiftUI

struct AccountEditView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var username: String
    @State private var fullName: String
    @State private var isLoading = false
    @State private var errorMessage: String?
    let onSaved: () async -> Void

    private let profileRepo = ProfileRepository()

    init(profile: Profile, onSaved: @escaping () async -> Void) {
        _username = State(initialValue: profile.username ?? "")
        _fullName = State(initialValue: profile.fullName ?? "")
        self.onSaved = onSaved
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("ユーザー名", text: $username)
                    TextField("フルネーム", text: $fullName)
                }
                if let msg = errorMessage { Section { ErrorBanner(message: msg) } }
            }
            .navigationTitle("プロフィール編集")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("キャンセル") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("保存") {
                        Task {
                            isLoading = true
                            do {
                                try await profileRepo.updateProfile(username: username, fullName: fullName)
                                await onSaved()
                                dismiss()
                            } catch {
                                errorMessage = error.localizedDescription
                            }
                            isLoading = false
                        }
                    }
                    .disabled(isLoading)
                }
            }
        }
    }
}
```

- [ ] **Step 3: Simulator で設定画面のログアウト動作を確認（ログアウト → ログイン画面へ遷移）**

- [ ] **Step 4: コミット**

```bash
git add Collecie/Features/Settings/
git commit -m "feat(ios): add SettingsView and AccountEditView"
```

---

## Task 19: メインの CollectListView をタブに接続

集金タブは店舗を選んでから集金記録を見る導線にする。

**Files:**
- Modify: `Collecie/Features/Collect/CollectListView.swift`（タブルートとして全店舗一覧に変更）

- [ ] **Step 1: `CollectListView.swift` をタブルート用に書き換え**

```swift
import SwiftUI

struct CollectListView: View {
    @State private var stores: [Store] = []
    @State private var isLoading = false
    @State private var storeRepository: any StoreRepositoryProtocol = StoreRepository()

    var body: some View {
        NavigationStack {
            Group {
                if isLoading {
                    ProgressView()
                } else if stores.isEmpty {
                    ContentUnavailableView("店舗がありません", systemImage: "building.2")
                } else {
                    List(stores) { store in
                        NavigationLink(store.store, destination: StoreCollectView(store: store))
                    }
                }
            }
            .navigationTitle("集金")
            .task {
                isLoading = true
                stores = (try? await storeRepository.getStores()) ?? []
                isLoading = false
            }
            .refreshable {
                stores = (try? await storeRepository.getStores()) ?? []
            }
        }
    }
}
```

`StoreCollectView` は `StoreDetailView` と同様に `CollectListView(store:)` にラップ:
```swift
import SwiftUI

struct StoreCollectView: View {
    let store: Store
    @State private var showNewCollect = false
    @State private var vm = CollectListViewModel()

    var body: some View {
        Group {
            if vm.isLoading {
                ProgressView()
            } else if vm.funds.isEmpty {
                ContentUnavailableView("集金データがありません", systemImage: "yensign.circle")
            } else {
                List(vm.funds) { fund in
                    NavigationLink(destination: CollectEditView(fund: fund, store: store)) {
                        VStack(alignment: .leading) {
                            Text(formatDate(fund.date)).font(.subheadline)
                            Text("¥\(fund.totalFunds.formatted())").font(.headline)
                        }
                    }
                }
            }
        }
        .navigationTitle(store.store)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button { showNewCollect = true } label: { Image(systemName: "plus") }
            }
        }
        .sheet(isPresented: $showNewCollect) {
            CollectNewView(store: store) {
                Task { await vm.loadFunds(storeId: store.id) }
            }
        }
        .task { await vm.loadFunds(storeId: store.id) }
        .refreshable { await vm.loadFunds(storeId: store.id) }
    }

    private func formatDate(_ epoch: Int64) -> String {
        let d = Date(timeIntervalSince1970: Double(epoch) / 1000)
        return d.formatted(date: .abbreviated, time: .omitted)
    }
}
```

- [ ] **Step 2: Simulator で全体フローを通しで確認**
  - ログイン → ホーム（当月合計表示）
  - 店舗タブ → 店舗一覧 → 詳細 → 集金記録
  - 集金タブ → 店舗選択 → 集金記録 → 新規登録
  - 設定タブ → プロフィール表示 → ログアウト

- [ ] **Step 3: 最終コミット**

```bash
git add Collecie/
git commit -m "feat(ios): complete Phase 1 — working MVP with auth, stores, collect, home, settings"
```

---

## Phase 1 完了チェックリスト

- [ ] DB: `device_tokens` テーブル作成済み
- [ ] DB: `laundry_state.inventory` JSONB 移行済み
- [ ] iOS: ログイン/サインアップ/パスワードリセット動作
- [ ] iOS: タブバー4つが正常に切り替わる
- [ ] iOS: 店舗の一覧・詳細・新規作成・編集・削除（adminロール）
- [ ] iOS: 集金データの一覧・新規登録（機械別・合計）・編集・削除
- [ ] iOS: ホームに当月集金合計が表示される
- [ ] iOS: 設定からプロフィール編集・ログアウトができる
- [ ] テスト: `Cmd+U` ですべてグリーン
- [ ] git: 全変更がコミット済み

---

## 次のPhase 2 で実装すること

1. オフライン同期（CollectRepository のドラフト保存・NetworkMonitor連携）
2. MachineStateView + InventoryEditView（在庫JSONB管理・アラート閾値設定）
3. OrgSettingsView（メンバー管理・招待・通知設定）
4. LogView（アクションメッセージ）
5. プッシュ通知（APNs + Supabase Edge Functions）
6. 招待ディープリンク（`collecie://invite?token=xxx`）
