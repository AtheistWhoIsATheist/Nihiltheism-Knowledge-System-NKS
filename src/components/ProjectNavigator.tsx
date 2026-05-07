import { Folder, FileText, ChevronRight, Hash } from 'lucide-react';

export function ProjectNavigator() {
    return (
        <div className="w-64 border-r border-border bg-sidebar shrink-0 p-4 h-full flex flex-col">
            <div className="mb-6">
                <h1 className="font-bold text-lg tracking-tight">NKS Core</h1>
                <div className="text-xs text-muted-foreground font-mono mt-1">BLACK SUN</div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 text-sm">
                {/* Journal314 */}
                <div>
                    <div className="flex items-center gap-2 font-medium text-sidebar-foreground mb-1 group cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground p-1 rounded">
                        <ChevronRight className="w-4 h-4 text-sidebar-foreground/50 transition-transform group-hover:text-sidebar-foreground" />
                        <Folder className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                        Journal314
                    </div>
                    <ul className="pl-6 space-y-1">
                        <li className="flex items-center gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer p-1 rounded hover:bg-sidebar-accent">
                            <FileText className="w-3.5 h-3.5" />
                            Daily
                        </li>
                        <li className="flex items-center gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer p-1 rounded hover:bg-sidebar-accent">
                            <FileText className="w-3.5 h-3.5" />
                            Phenomenology
                        </li>
                        <li className="flex items-center gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer p-1 rounded hover:bg-sidebar-accent">
                            <FileText className="w-3.5 h-3.5" />
                            Fragments
                        </li>
                    </ul>
                </div>

                {/* REN */}
                <div>
                    <div className="flex items-center gap-2 font-medium text-sidebar-foreground mb-1 group cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground p-1 rounded">
                         <ChevronRight className="w-4 h-4 text-sidebar-foreground/50" />
                         <Folder className="w-4 h-4 text-indigo-500 fill-indigo-500/20" />
                         REN
                    </div>
                </div>

                {/* Library */}
                <div>
                    <div className="flex items-center gap-2 font-medium text-sidebar-foreground mb-1 group cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground p-1 rounded">
                         <ChevronRight className="w-4 h-4 text-sidebar-foreground/50" />
                         <Folder className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                         Library
                    </div>
                </div>
                
                 {/* Defense */}
                 <div>
                    <div className="flex items-center gap-2 font-medium text-sidebar-foreground mb-1 group cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground p-1 rounded">
                         <ChevronRight className="w-4 h-4 text-sidebar-foreground/50" />
                         <Folder className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                         Defense
                    </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                     <div className="flex items-center gap-2 font-medium text-sidebar-foreground mb-2 px-1">
                         Tags
                     </div>
                     <ul className="pl-2 space-y-1">
                         <li className="flex items-center gap-1.5 text-xs text-sidebar-foreground/70 cursor-pointer p-1 hover:bg-sidebar-accent rounded">
                            <Hash className="w-3 h-3" /> nihilism
                         </li>
                         <li className="flex items-center gap-1.5 text-xs text-sidebar-foreground/70 cursor-pointer p-1 hover:bg-sidebar-accent rounded">
                            <Hash className="w-3 h-3" /> apophasis
                         </li>
                     </ul>
                </div>

            </div>

             <div className="pt-4 border-t border-border/50 text-[10px] uppercase text-muted-foreground tracking-wider font-mono">
                 Sync Verified
            </div>
        </div>
    )
}
