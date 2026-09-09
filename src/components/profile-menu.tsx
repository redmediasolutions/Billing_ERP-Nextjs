"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { Building2, CreditCard, LogOut, Mail, UserCircle } from "lucide-react";

import { auth } from "@/firebase/config";
import { usePlatformAdmin } from "@/hooks/use-platform-admin";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

export function ProfileMenu() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { isPlatformAdmin } = usePlatformAdmin();

  useEffect(() => {
    setMounted(true);

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return unsubscribe;
  }, []);

  async function logout() {
    queryClient.clear();
    await signOut(auth);
    router.replace("/login");
  }

  // Prevent SSR hydration issues
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full"
      >
        U
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full font-semibold"
        >
          {user?.email?.[0]?.toUpperCase() ?? "U"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-72"
      >
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <UserCircle className="h-10 w-10 text-muted-foreground" />

            <div className="min-w-0">
              <p className="font-semibold">Logged in</p>

              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">
                  {user?.email ?? "Not signed in"}
                </span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => router.push("/dashboard/subscription")}
          className="cursor-pointer"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Software licence
        </DropdownMenuItem>

        {isPlatformAdmin ? (
          <DropdownMenuItem
            onClick={() => router.push("/dashboard/platform/licenses")}
            className="cursor-pointer"
          >
            <Building2 className="mr-2 h-4 w-4" />
            Tenant licences
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={logout}
          className="cursor-pointer text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}