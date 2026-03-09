"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RoleSelect } from "../../components/RoleSelect";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

type Role = { id: number; code: string };

export default function RoleSetupPage() {
  const router = useRouter();
  const [error, setError] = React.useState("");
  const [stakeAddress, setStakeAddress] = React.useState<string | null>(null);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = React.useState<number | null>(
    null
  );
  const [displayName, setDisplayName] = React.useState<string>("");
  const [location, setLocation] = React.useState<string>("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      document.cookie = "auth_token=; path=/; max-age=0";
      window.sessionStorage.removeItem("profile_setup");
      window.location.assign("/");
      return;
    }
    router.replace("/");
  };

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem("profile_setup");
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as {
        stakeAddress?: string;
        roles?: Role[];
      };
      if (!parsed?.stakeAddress) {
        router.replace("/");
        return;
      }
      setStakeAddress(parsed.stakeAddress);
      const rs =
        Array.isArray(parsed.roles) && parsed.roles.length > 0
          ? parsed.roles
          : ([
              { id: 1, code: "ENTERPRISE" },
              { id: 2, code: "TRANSIT" },
              { id: 3, code: "AGENT" },
            ] satisfies Role[]);
      setRoles(rs);
      setDisplayName("");
      setLocation("");
    } catch {
      router.replace("/");
    }
  }, [router]);

  const handleSubmit = async () => {
    setError("");
    const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;
    if (!stakeAddress || !selectedRole || !displayName.trim() || !location.trim()) {
      setError("Please select a role and fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            document.cookie.split("auth_token=")[1]?.split(";")[0]
          }`,
        },
        body: JSON.stringify({
          roleCode: selectedRole.code,
          displayName: displayName.trim(),
          location: location.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to create profile"
        );
      }
      if (data?.token) {
        document.cookie = `auth_token=${data.token}; path=/; max-age=604800`;
      }
      if (typeof document !== "undefined") {
        window.sessionStorage.removeItem("profile_setup");
      }
      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while creating profile."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!stakeAddress) {
    return null;
  }

  return (
    <div className="role-setup-page">
      <div className="role-setup-card">
        <h1 className="role-setup-title">Choose your role</h1>
        <p className="role-setup-subtitle">
          Select a role and complete your profile to continue.
        </p>

        <div className="role-setup-stack">
          <RoleSelect
            roles={roles}
            selectedRoleId={selectedRoleId}
            onChange={setSelectedRoleId}
            disabled={submitting}
          />

          {selectedRoleId && (
            <>
              <div className="role-setup-field">
                <label htmlFor="displayName" className="role-setup-label">
                  Display name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={submitting}
                  className="role-setup-input"
                />
              </div>
              <div className="role-setup-field">
                <label htmlFor="location" className="role-setup-label">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={submitting}
                  className="role-setup-input"
                />
              </div>
            </>
          )}

          <button
            type="button"
            className="role-setup-primaryBtn"
            onClick={handleSubmit}
            disabled={
              submitting ||
              !selectedRoleId ||
              !displayName.trim() ||
              !location.trim()
            }
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>

          {error && (
            <p className="role-setup-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="button"
            className="role-setup-secondaryBtn"
            onClick={handleLogout}
            disabled={submitting}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

