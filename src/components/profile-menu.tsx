"use client";

import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import {
  LogOut,
  Mail,
  UserCircle,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

export function ProfileMenu() {
  const router = useRouter();

  const auth = getAuth();
  const user = auth.currentUser;

  async function logout() {
    await signOut(auth);
    router.replace("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full font-semibold"
        >
          {user?.email?.charAt(0).toUpperCase() ?? "U"}
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
              <p className="font-semibold">
                Logged in
              </p>

              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />

                <span className="truncate">
                  {user?.email ?? "Unknown"}
                </span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={logout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}