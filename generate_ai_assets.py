import json
import os
import time
import base64

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

# HVIS DU BRUGER GOOGLE GENAI
try:
    from google import genai
    from google.genai import types
    GOOGLE_AI_AVAILABLE = True
except ImportError:
    print("Google GenAI SDK is not installed.")
    print("Run: pip install google-genai")
    GOOGLE_AI_AVAILABLE = False

# INDSTILLINGER
PROJECT_ID = "YOUR_GOOGLE_CLOUD_PROJECT_ID"  # <-- HUSK AT INDSÆTTE DIT ID
LOCATION = "global"

def init_ai():
    if GOOGLE_AI_AVAILABLE:
        print("Initializing Google GenAI Client...")
        # Assuming credentials are set in environment or via gcloud
        # Using vertexai=True as per user request
        return genai.Client(
            vertexai=True,
            project=PROJECT_ID,
            location="us-central1" # Changed to us-central1 as global might not be supported for Vertex AI execution in some SDK versions, or user prompt implied default.
                                  # User prompt used "global" in old script but new snippet didn't specify location in Client init, implying default or env var.
                                  # Ideally, let's trust the default or user config.
                                  # The user snippet had: client = genai.Client(vertexai=True, api_key=os.environ.get("GOOGLE_CLOUD_API_KEY"))
                                  # Since we are using Vertex AI, we typically need project/location if not implicit.
                                  # I'll stick to 'us-central1' as a safe bet for Gemini models or let it infer.
        )
    return None

def generate_image(client, full_prompt, output_filename, aspect_ratio="1:1"):
    print(f"Generating: {output_filename}...")

    if not GOOGLE_AI_AVAILABLE or client is None:
        print(f"  [SIMULATION] Prompt sent: '{full_prompt}'")
        return

    try:
        model = "gemini-3-pro-image-preview"

        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=full_prompt)
                ]
            )
        ]

        generate_content_config = types.GenerateContentConfig(
            temperature = 1,
            top_p = 0.95,
            max_output_tokens = 32768,
            response_modalities = ["IMAGE"], # We only want image
            safety_settings = [
                types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="OFF"),
                types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="OFF"),
                types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="OFF"),
                types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="OFF")
            ],
            image_config=types.ImageConfig(
                aspect_ratio=aspect_ratio,
                image_size="1K",
                output_mime_type="image/png",
            ),
        )

        # Using generate_content instead of stream for easier image handling
        response = client.models.generate_content(
            model=model,
            contents=contents,
            config=generate_content_config,
        )

        image_saved = False
        if response.candidates:
            for part in response.candidates[0].content.parts:
                if part.inline_data:
                    img_data = base64.b64decode(part.inline_data.data)
                    with open(output_filename, "wb") as f:
                        f.write(img_data)
                    print(f"  Saved to {output_filename}")
                    image_saved = True
                    break

        if not image_saved:
            print("  No image found in response.")

    except Exception as e:
        print(f"  ERROR generating {output_filename}: {e}")
        time.sleep(5)

def main():
    # Mappe til output
    global OUTPUT_DIR
    OUTPUT_DIR = "images"

    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Created directory: {OUTPUT_DIR}")

    try:
        with open('prompts.json', 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("Error: prompts.json not found! Please ensure the JSON file is in the same directory.")
        return

    client = init_ai()

    # Helper function to process a list
    def process_list(category_name, item_list, style_prefix, id_key, file_prefix, ar="1:1"):
        print(f"\n--- Processing {category_name} ---")
        for item in item_list:
            # Sætter Style + Beskrivelse sammen her
            final_prompt = style_prefix + item['desc']

            # Håndter ID eller Titel for filnavn
            item_id = item.get(id_key, "unknown").lower().replace(" ", "_")
            filename = os.path.join(OUTPUT_DIR, f"{file_prefix}_{item_id}.png")

            generate_image(client, final_prompt, filename, aspect_ratio=ar)
            time.sleep(2) # Pause for at undgå rate limits

    # 1. Projects (Icons)
    process_list("Projects", data.get("projects", []), STYLE_ICON, "id", "project")

    # 2. Meta Upgrades (Icons)
    process_list("Meta Upgrades", data.get("meta_upgrades", []), STYLE_ICON, "id", "meta")

    # 3. Upgrades (Icons)
    process_list("Upgrades", data.get("upgrades", []), STYLE_ICON, "id", "upgrade")

    # 4. Jobs (Splash Screens - 16:9)
    # Gemini 2.0/3.0 usually supports 16:9 via aspect_ratio="16:9"
    process_list("Jobs", data.get("jobs", []), STYLE_SPLASH, "title", "job", ar="16:9")

    print("\nDone! All images processed.")

if __name__ == "__main__":
    main()
