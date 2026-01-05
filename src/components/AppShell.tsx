import * as React from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { LocationSwitcher } from "@/components/locations/LocationSwitcher";

interface BreadcrumbItemType {
  label: string;
  href: string;
}

interface AppShellProps {
  children: React.ReactNode;
  currentLocationId?: string;
  currentPath?: string;
  breadcrumbs: BreadcrumbItemType[];
  userEmail?: string;
}

export function AppShell({
  children,
  currentLocationId,
  currentPath,
  breadcrumbs,
  userEmail,
}: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar
        currentLocationId={currentLocationId}
        currentPath={currentPath}
        userEmail={userEmail}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-background">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbs.length > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                {breadcrumbs.map((crumb, index) => (
                  <BreadcrumbItem key={crumb.href}>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <>
                        <BreadcrumbLink href={crumb.href} className="hidden md:block">
                          {crumb.label}
                        </BreadcrumbLink>
                        <BreadcrumbSeparator className="hidden md:block" />
                      </>
                    )}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <LocationSwitcher currentLocationId={currentLocationId} />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0 mt-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
