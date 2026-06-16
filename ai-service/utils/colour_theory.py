warm_colours = [
    "Beige", "Camel", "Rust", "Olive", "Mustard",
    "Terracotta", "Brown", "Coral"
]

cool_colours = [
    "Navy", "Emerald", "Burgundy", "Lavender", "Cobalt",
    "Rose", "Slate", "Plum"
]

neutral_colours = [
    "White", "Grey", "Black", "Taupe", "Blush",
    "Sage", "Dusty Blue", "Mauve"
]

# Hex colour approximations for frontend swatch rendering
colour_hex_map = {
    # Warm
    "Beige":      "#F5F0E8",
    "Camel":      "#C19A6B",
    "Rust":       "#B7410E",
    "Olive":      "#808000",
    "Mustard":    "#FFDB58",
    "Terracotta": "#E2725B",
    "Brown":      "#795548",
    "Coral":      "#FF6B6B",
    # Cool
    "Navy":       "#003366",
    "Emerald":    "#50C878",
    "Burgundy":   "#800020",
    "Lavender":   "#C8A2C8",
    "Cobalt":     "#0047AB",
    "Rose":       "#FF007F",
    "Slate":      "#708090",
    "Plum":       "#8E4585",
    # Neutral
    "White":      "#FFFFFF",
    "Grey":       "#9E9E9E",
    "Black":      "#1A1A1A",
    "Taupe":      "#B8A99A",
    "Blush":      "#F4C2C2",
    "Sage":       "#87AE73",
    "Dusty Blue": "#6699CC",
    "Mauve":      "#E0B0FF",
}


def get_palette(skin_tone: str) -> list[dict[str, str]]:
    """Return list of {name, hex} dicts for the given skin tone."""
    if skin_tone == "warm":
        names = warm_colours
    elif skin_tone == "cool":
        names = cool_colours
    else:
        names = neutral_colours
    return [{"name": n, "hex": colour_hex_map.get(n, "#CCCCCC")} for n in names]
