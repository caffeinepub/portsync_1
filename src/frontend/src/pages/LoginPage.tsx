import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Anchor, Container, Globe, Ship } from "lucide-react";
import { useState } from "react";
import { ActorRole } from "../backend.d";

interface LoginPageProps {
  onLogin: (name: string, role: ActorRole) => void;
  isLoading: boolean;
}

const roleOptions = [
  {
    value: ActorRole.admin,
    label: "Administrator",
    desc: "Full system access",
  },
  {
    value: ActorRole.portAgent,
    label: "Port Agent",
    desc: "Vessel & cargo operations",
  },
  {
    value: ActorRole.customsOfficer,
    label: "Customs Officer",
    desc: "Document clearance",
  },
  {
    value: ActorRole.shippingLine,
    label: "Shipping Line",
    desc: "Vessel management",
  },
];

export function LoginPage({ onLogin, isLoading }: LoginPageProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<ActorRole | "">("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && role) {
      onLogin(name.trim(), role);
    }
  };

  return (
    <div className="min-h-screen bg-sidebar flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-3/5 relative flex-col justify-between p-12 overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, oklch(0.64 0.17 197) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, oklch(0.55 0.15 258) 0%, transparent 40%),
              radial-gradient(circle at 60% 80%, oklch(0.45 0.1 240) 0%, transparent 40%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, oklch(0.92 0.01 250) 39px, oklch(0.92 0.01 250) 40px),
              repeating-linear-gradient(90deg, transparent, transparent 39px, oklch(0.92 0.01 250) 39px, oklch(0.92 0.01 250) 40px)`,
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-3 mb-20">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <Ship className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-white text-xl">
              PortSync
            </span>
          </div>

          <div className="max-w-md">
            <h2 className="font-display text-5xl font-bold text-white leading-tight mb-6">
              Smart Port
              <br />
              <span className="text-teal-400">Community</span>
              <br />
              System
            </h2>
            <p className="text-white text-lg leading-relaxed">
              Unified platform for cargo tracking, documentation, and
              stakeholder coordination across all port operations.
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative grid grid-cols-3 gap-6">
          {[
            { icon: Container, label: "Containers", value: "24,830" },
            { icon: Globe, label: "Trade Routes", value: "180+" },
            { icon: Anchor, label: "Berths", value: "48" },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="border border-sidebar-border rounded-xl p-4"
            >
              <Icon className="w-5 h-5 text-teal-400 mb-2" />
              <div className="text-2xl font-display font-bold text-white">
                {value}
              </div>
              <div className="text-xs text-white/90 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-2/5 bg-white flex flex-col items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <Ship className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-foreground text-xl">
              PortSync
            </span>
          </div>

          <div className="mb-8">
            <h3 className="font-display text-2xl font-bold text-foreground">
              Welcome back
            </h3>
            <p className="text-foreground/70 text-sm mt-1">
              Sign in to your PortSync account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Full Name
              </Label>
              <Input
                id="name"
                data-ocid="login.name.input"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="role"
                className="text-sm font-medium text-foreground"
              >
                Your Role
              </Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as ActorRole)}
                required
              >
                <SelectTrigger
                  id="role"
                  data-ocid="login.role.select"
                  className="h-11"
                >
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div>
                        <div className="font-medium">{opt.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {opt.desc}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              data-ocid="login.submit_button"
              className="w-full h-11 bg-primary hover:bg-primary/90 font-semibold"
              disabled={!name.trim() || !role || isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In to PortSync"}
            </Button>
          </form>

          <p className="text-center text-xs text-foreground/50 mt-8">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="text-accent hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
