// Firestore Rules for Marketing Analytics Application
rules_version = "2"

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null
    }

    function isActive() {
      return (
        isSignedIn() &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.status == "active"
      )
    }

    function isSuperAdmin() {
      return (
        isSignedIn() &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "super_admin"
      )
    }

    function isMember() {
      return (
        isSignedIn() &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "member"
      )
    }

    function isViewer() {
      return (
        isSignedIn() &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "viewer"
      )
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId
    }

    // For local development, allow all access
    match /{document=**} {
      allow read, write: if true;
    }

    // Production rules (commented out for now)
    /*
    // Default deny all
    match /{document=**} {
      allow read, write: if false;
    }

    // Users collection
    match /users/{userId} {
      // Anyone can read user documents
      allow read: if isSignedIn();
      
      // Only super admins can create/update/delete any user
      // Users can update their own documents
      allow create, update, delete: if isSuperAdmin() || isOwner(userId);
    }

    // Posts collection
    match /posts/{postId} {
      // Any active user can read posts
      allow read: if isActive();
      
      // Super admins and members can write posts
      allow create, update, delete: if isActive() && (isSuperAdmin() || isMember());
    }

    // Sources collection
    match /sources/{sourceId} {
      // Any active user can read sources
      allow read: if isActive();
      
      // Super admins and members can write sources
      allow create, update, delete: if isActive() && (isSuperAdmin() || isMember());
    }

    // Settings collection
    match /settings/{settingId} {
      // Any active user can read settings
      allow read: if isActive();
      
      // Super admins and members can write settings
      allow create, update, delete: if isActive() && (isSuperAdmin() || isMember());
    }

    // Reports collection
    match /reports/{reportId} {
      // Any active user can read reports
      allow read: if isActive();
      
      // Super admins and members can write reports
      allow create, update, delete: if isActive() && (isSuperAdmin() || isMember());
    }
    */
  }
}
