# ==================== CONFIGURACIÓN ====================
import os
ROOT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Categorias")
OPENAI_API_KEY = ""       # Pon tu API key de OpenAI

# Configuración de análisis IA
MAX_IMAGENES_POR_PRODUCTO = 4  # Cuántas imágenes enviar a la IA
MODELO_GPT = "gpt-4o"  # Opciones: "gpt-4o", "gpt-4-turbo", "gpt-4o-mini"

# Extensiones de archivos
EXTENSIONES_IMAGENES = ('.jpg', '.jpeg', '.png', '.webp')
EXTENSIONES_VIDEOS = ('.mp4', '.mov', '.avi')

# Idioma de las descripciones
IDIOMA = "español"  # Cambia si quieres otro idioma

# Longitud de descripciones
PALABRAS_DESCRIPTION_MIN = 40
PALABRAS_DESCRIPTION_MAX = 60

# ==================== CÓDIGO ====================
import base64
from openai import OpenAI
import json

client = OpenAI(api_key=OPENAI_API_KEY)

def procesar_productos(root_path):
    if not os.path.exists(root_path):
        print(f"❌ Error: No existe la carpeta '{root_path}'")
        return
    
    code_counter = 1  # Para generar códigos correlativos
    productos_procesados = 0
    productos_omitidos = 0
    
    # Recorrer categorías (ej: bolsos, carteras, etc.)
    for categoria in os.listdir(root_path):
        categoria_path = os.path.join(root_path, categoria)
        
        if not os.path.isdir(categoria_path):
            continue
        
        print(f"\n📂 Categoría: {categoria}")
        
        # Recorrer productos dentro de cada categoría (ej: Bolso London)
        for producto in os.listdir(categoria_path):
            producto_path = os.path.join(categoria_path, producto)
            
            if os.path.isdir(producto_path):
                # Verificar si ya existe metadata.txt
                metadata_path = os.path.join(producto_path, 'metadata.txt')
                
                if os.path.exists(metadata_path):
                    print(f"  ⏭️  Producto: {producto} - YA TIENE metadata.txt (omitido)")
                    productos_omitidos += 1
                else:
                    print(f"  📦 Procesando producto: {producto}")
                    if generar_metadata(producto_path, str(code_counter).zfill(2)):
                        productos_procesados += 1
                    code_counter += 1
    
    print(f"\n{'='*50}")
    print(f"✅ Productos procesados: {productos_procesados}")
    print(f"⏭️  Productos omitidos (ya tenían metadata): {productos_omitidos}")
    print(f"{'='*50}")

def generar_metadata(producto_path, code):
    # Listar archivos
    archivos = os.listdir(producto_path)
    imagenes = [f for f in archivos 
                if f.lower().endswith(EXTENSIONES_IMAGENES)]
    videos = [f for f in archivos 
              if f.lower().endswith(EXTENSIONES_VIDEOS)]
    
    if not imagenes:
        print(f"    ⚠️  No hay imágenes en esta carpeta")
        return False
    
    print(f"    🖼️  Encontradas {len(imagenes)} imágenes")
    
    # Analizar con IA
    contenido_ia = analizar_con_gpt(producto_path, imagenes)
    
    # Crear metadata.txt
    metadata = f"""title: {contenido_ia['title']}
subtitle: {contenido_ia['subtitle']}
description: {contenido_ia['description']}
code: {code}
images: {', '.join(imagenes)}
videos: {', '.join(videos) if videos else ''}"""
    
    # Guardar archivo
    metadata_path = os.path.join(producto_path, 'metadata.txt')
    with open(metadata_path, 'w', encoding='utf-8') as f:
        f.write(metadata)
    
    print(f"    ✅ Generado: metadata.txt")
    return True

def analizar_con_gpt(producto_path, imagenes):
    # Preparar imágenes (máximo según configuración)
    imagenes_content = []
    for img in imagenes[:MAX_IMAGENES_POR_PRODUCTO]:
        img_path = os.path.join(producto_path, img)
        with open(img_path, 'rb') as f:
            img_base64 = base64.b64encode(f.read()).decode('utf-8')
            ext = img.split('.')[-1].lower()
            media_type = f"image/{ext if ext != 'jpg' else 'jpeg'}"
            
            imagenes_content.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:{media_type};base64,{img_base64}"
                }
            })
    
    # Prompt dinámico según configuración
    prompt = f"""Analiza estas imágenes de producto y genera metadata en {IDIOMA}:

- title: Nombre del producto (2-4 palabras, ej: "Bolso Duffle")
- subtitle: Característica principal (3-5 palabras, ej: "Cuero Para Viajar")
- description: Descripción detallada destacando materiales, artesanía y uso ({PALABRAS_DESCRIPTION_MIN}-{PALABRAS_DESCRIPTION_MAX} palabras)

Responde SOLO en formato JSON válido:
{{"title": "...", "subtitle": "...", "description": "..."}}"""
    
    # Llamada a GPT-4 Vision
    response = client.chat.completions.create(
        model=MODELO_GPT,
        messages=[{
            "role": "user",
            "content": imagenes_content + [{
                "type": "text",
                "text": prompt
            }]
        }],
        max_tokens=500
    )
    
    try:
        return json.loads(response.choices[0].message.content)
    except:
        # Fallback por si la respuesta no es JSON puro
        text = response.choices[0].message.content
        # Extraer JSON si viene con markdown
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        return json.loads(text.strip())

# Ejecutar
if __name__ == "__main__":
    if OPENAI_API_KEY == "tu-api-key-aqui":
        print("⚠️  CONFIGURA OPENAI_API_KEY en la parte superior del script")
    else:
        print(f"📁 Buscando productos en: {ROOT_PATH}\n")
        procesar_productos(ROOT_PATH)
        print("\n✅ Proceso completado!")