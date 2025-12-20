import json
import os
import time

# --- KONFIGURATION AF STIL (SYSTEM PROMPTS) ---

# Stil til Upgrades, Projects og Meta (Firkantede ikoner)
STYLE_ICON = (
    "Windows 95 aesthetic pixel art icon, inside a bevelled grey button frame. "
    "16-bit graphics, 256 color VGA palette, dithered shading, low resolution, blocky. "
    "Subject: "
)

# Stil til Jobs (Brede splash screens)
STYLE_SPLASH = (
    "Wide horizontal pixel art illustration, Windows 95 splash screen style. "
    "Retro computing interface, 256 color VGA palette, dithered textures, low resolution CRT monitor effect. "
    "Scene: "
)

# ----------------------------------------------

# HVIS DU BRUGER GOOGLE VERTEX AI
try:
    import vertexai
    from vertexai.preview.vision_models import ImageGenerationModel
    GOOGLE_AI_AVAILABLE = True
except ImportError:
    print("Google Cloud AI Platform (vertexai) is not installed.")
    print("Run: pip install google-cloud-aiplatform")
    GOOGLE_AI_AVAILABLE = False

# INDSTILLINGER
PROJECT_ID = "YOUR_GOOGLE_CLOUD_PROJECT_ID"  # <-- HUSK AT INDSÆTTE DIT ID
LOCATION = "global"                            # <-- Ændret til 'global'

def init_ai():
    if GOOGLE_AI_AVAILABLE:
        vertexai.init(project=PROJECT_ID, location=LOCATION)

        # Ændret til den specifikke model du bad om
        print(f"Loading model: gemini-3-pro-image-preview in {LOCATION}...")
        return ImageGenerationModel.from_pretrained("gemini-3-pro-image-preview")
    return None

def generate_image(model, full_prompt, output_filename, aspect_ratio="1:1"):
    print(f"Generating: {output_filename}...")

    if not GOOGLE_AI_AVAILABLE:
        print(f"  [SIMULATION] Prompt sent: '{full_prompt}'")
        return

    try:
        images = model.generate_images(
            prompt=full_prompt,
            number_of_images=1,
            language="en",
            aspect_ratio=aspect_ratio,
            safety_filter_level="block_some",
            person_generation="allow_adult"
        )
        if images:
            images[0].save(location=output_filename, include_generation_parameters=False)
            print(f"  Saved to {output_filename}")
        else:
            print("  No image generated.")
    except Exception as e:
        print(f"  ERROR generating {output_filename}: {e}")
        # Vent lidt længere hvis vi rammer fejl, da preview modeller kan være ustabile
        time.sleep(5)

def main():
    # Mappe til output
    global OUTPUT_DIR
    OUTPUT_DIR = "images" # Changed from 'generated_images' to 'images' to overwrite placeholders

    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Created directory: {OUTPUT_DIR}")

    try:
        with open('prompts.json', 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("Error: prompts.json not found! Please ensure the JSON file is in the same directory.")
        return

    model = init_ai()

    # Helper function to process a list
    def process_list(category_name, item_list, style_prefix, id_key, file_prefix, ar="1:1"):
        print(f"\n--- Processing {category_name} ---")
        for item in item_list:
            # Sætter Style + Beskrivelse sammen her
            final_prompt = style_prefix + item['desc']

            # Håndter ID eller Titel for filnavn
            item_id = item.get(id_key, "unknown").lower().replace(" ", "_")
            filename = os.path.join(OUTPUT_DIR, f"{file_prefix}_{item_id}.png")

            # Since we want to overwrite placeholders, we might remove the exists check?
            # But the user might run this multiple times.
            # If the file exists, it might be the placeholder OR a real AI image.
            # The user said "modify the script so it correctly replaces the placeholder images".
            # If I leave the check `if not os.path.exists(filename):`, it won't overwrite.
            # So I should remove the check to force overwrite, OR assume the user will delete them if they want to regenerate.
            # However, typically generation scripts check existence to resume.
            # But here the GOAL is to replace placeholders. Placeholders exist.
            # So I must remove the existence check to allow overwriting.

            # if not os.path.exists(filename):
            generate_image(model, final_prompt, filename, aspect_ratio=ar)
            time.sleep(2) # Pause for at undgå rate limits

    # 1. Projects (Icons)
    process_list("Projects", data.get("projects", []), STYLE_ICON, "id", "project")

    # 2. Meta Upgrades (Icons)
    process_list("Meta Upgrades", data.get("meta_upgrades", []), STYLE_ICON, "id", "meta")

    # 3. Upgrades (Icons)
    process_list("Upgrades", data.get("upgrades", []), STYLE_ICON, "id", "upgrade")

    # 4. Jobs (Splash Screens - 16:9)
    process_list("Jobs", data.get("jobs", []), STYLE_SPLASH, "title", "job", ar="16:9")

    print("\nDone! All images processed.")

if __name__ == "__main__":
    main()
