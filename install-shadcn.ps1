$components = @(
    "button",
    "card",
    "input",
    "textarea",
    "label",
    "select",
    "table",
    "dropdown-menu",
    "alert",
    "dialog",
    "toast",
    "avatar",
    "badge",
    "checkbox",
    "radio-group",
    "tooltip",
    "accordion",
    "sheet",
    "skeleton",
    "progress",
    "tabs",
    "pagination",
    "slider",
    "switch",
    "breadcrumb",
    "popover",
    "navigation-menu"
)

foreach ($component in $components) {
    Write-Host "Installing component: $component" -ForegroundColor Green
    npx shadcn@latest add $component
}
