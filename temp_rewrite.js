const fs = require('fs');
const file = "/Users/arnaldoallende/Documents/GitHub/khora/app/dashboard/productos/page.tsx";
let code = fs.readFileSync(file, 'utf8');

// Add thumbnail to interface
code = code.replace(
  /content_url: string\n\s*is_active: boolean/g,
  "content_url: string\n  thumbnail_url: string | null\n  is_active: boolean"
);

// Remove Lesson and ProductResource interfaces
code = code.replace(/interface Lesson \{[\s\S]*?\}\n\n/g, '');
code = code.replace(/interface ProductResource \{[\s\S]*?\}\n\n/g, '');

// Remove states
code = code.replace(/const \[lessons, setLessons\] = useState<Lesson\[\]>\(\[\]\)\n/g, '');
code = code.replace(/const \[resources, setResources\] = useState<ProductResource\[\]>\(\[\]\)\n/g, '');
code = code.replace(/const \[expandedProductId, setExpandedProductId\] = useState<string \| null>\(null\)\n/g, '');

// Remove lesson and resource states
code = code.replace(/\/\/ Form States for creating a lesson[\s\S]*?submittingLesson\] = useState\(false\)\n\n/g, '');
code = code.replace(/\/\/ Form States for creating a resource[\s\S]*?submittingResource\] = useState\(false\)\n\n/g, '');

// Add newThumbnailUrl state
code = code.replace(
  /const \[newContentUrl, setNewContentUrl\] = useState\(""\)\n/g,
  'const [newContentUrl, setNewContentUrl] = useState("")\n  const [newThumbnailUrl, setNewThumbnailUrl] = useState("")\n'
);

// Edit Product States
code = code.replace(
  /const \[submittingProduct, setSubmittingProduct\] = useState\(false\)\n/g,
  'const [submittingProduct, setSubmittingProduct] = useState(false)\n  const [editingProductId, setEditingProductId] = useState<string | null>(null)\n  const [editPrice, setEditPrice] = useState("")\n  const [editThumbnail, setEditThumbnail] = useState("")\n'
);

// Remove fetches for Lesson and Resource
code = code.replace(/\/\/ 2\. Fetch Lessons[\s\S]*?setLessons\(lessData \|\| \[\]\)\n\n/g, '');
code = code.replace(/\/\/ 3\. Fetch Resources[\s\S]*?setResources\(rescData \|\| \[\]\)\n\n/g, '');
code = code.replace(/const productLessons = .*?\n/g, '');
code = code.replace(/const productResources = .*?\n/g, '');

// Add thumbnail to product insert
code = code.replace(
  /content_url: newContentUrl\.trim\(\) \|\| "https:\/\/khora\.cl",\n/g,
  'content_url: newContentUrl.trim() || "https://khora.cl",\n          thumbnail_url: newThumbnailUrl.trim() || null,\n'
);

// Add reset for newThumbnailUrl
code = code.replace(
  /setNewContentUrl\(""\)\n/g,
  'setNewContentUrl("")\n      setNewThumbnailUrl("")\n'
);

// Remove CRUD for lessons and resources
code = code.replace(/\/\/ --- LESSON CRUD FUNCTIONS ---[\s\S]*?\/\/ --- RESOURCE CRUD FUNCTIONS ---[\s\S]*?handleDeleteResource.*?\} catch.*?\}\n  \}\n\n/g, '');

// Remove expanded productId check in handleDeleteProduct
code = code.replace(/if \(expandedProductId === id\) setExpandedProductId\(null\)\n/g, '');

// Add handleEditSave
code = code.replace(
  /const handleToggleActive = async \(product: Product\) => \{/g,
  `const handleSaveEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from("Product")
        .update({ price: parseInt(editPrice, 10), thumbnail_url: editThumbnail.trim() || null })
        .eq("id", id)

      if (error) throw error
      setProducts(prev => prev.map(p => p.id === id ? { ...p, price: parseInt(editPrice, 10), thumbnail_url: editThumbnail.trim() || null } : p))
      setEditingProductId(null)
      toast("Producto actualizado", "success")
    } catch (err: any) {
      toast(err.message, "error")
    }
  }

  const handleToggleActive = async (product: Product) => {`
);

// Form input for thumbnail
code = code.replace(
  /\{newType === "COURSE" \? \([\s\S]*?\} \: \(/g,
  `{newType === "COURSE" ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1.5 pl-1">Enlace de Respaldo General (Opcional)</label>
                    <input
                      type="url"
                      value={newContentUrl}
                      onChange={e => setNewContentUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-indigo-400 focus:bg-white text-xs font-semibold text-neutral-800 transition-all placeholder:font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1.5 pl-1">URL Miniatura (Imagen)</label>
                    <input
                      type="url"
                      value={newThumbnailUrl}
                      onChange={e => setNewThumbnailUrl(e.target.value)}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-indigo-400 focus:bg-white text-xs font-semibold text-neutral-800 transition-all placeholder:font-medium"
                    />
                  </div>
                </div>
              ) : (`
);

// UI: Remove expanded block (889-1044)
code = code.replace(/\{\/\* EXPANDED SECTION: LESSONS & MATERIAL MANAGEMENT \(Only for COURSE\) \*\/\}[\s\S]*?\{\/\* HISTORICAL SALES \*\/\}/g, '{/* HISTORICAL SALES */}');

// UI: Remove Contenido button
code = code.replace(/\{product.type === "COURSE" && \([\s\S]*?\}\)/g, '');

// UI: Add Editing block and Edit button
code = code.replace(
  /<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">/g,
  `{editingProductId === product.id ? (
                        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                          <h4 className="text-xs font-black uppercase text-neutral-900">Editar {product.title}</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="number"
                              value={editPrice}
                              onChange={e => setEditPrice(e.target.value)}
                              placeholder="Precio"
                              className="px-3 py-2 border border-neutral-200 rounded-xl text-xs font-bold w-full"
                            />
                            <input
                              type="url"
                              value={editThumbnail}
                              onChange={e => setEditThumbnail(e.target.value)}
                              placeholder="URL Miniatura"
                              className="px-3 py-2 border border-neutral-200 rounded-xl text-xs font-bold w-full"
                            />
                          </div>
                          <div className="flex gap-2 justify-end mt-2">
                            <button onClick={() => setEditingProductId(null)} className="px-3 py-1.5 text-xs font-bold text-neutral-500 hover:bg-neutral-100 rounded-lg">Cancelar</button>
                            <button onClick={() => handleSaveEdit(product.id)} className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-indigo-600">Guardar</button>
                          </div>
                        </div>
                      ) : (
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">`
);

// Add the closing tag for editingProductId logic
code = code.replace(
  /<button\n\s*onClick=\{.*?handleDeleteProduct.*?\}[\s\S]*?<\/button>\n\s*<\/div>\n\s*<\/div>/g,
  `$&
                      )}`
);

// UI: Add the Edit Button
code = code.replace(
  /<button\n\s*onClick=\{.*?handleToggleActive.*?\}[\s\S]*?<\/button>/g,
  `<button
                            onClick={() => {
                              setEditingProductId(product.id)
                              setEditPrice(product.price.toString())
                              setEditThumbnail(product.thumbnail_url || "")
                            }}
                            className="px-3 py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border border-neutral-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                          >
                            Editar
                          </button>
                          $&`
);

code = code.replace(/\{productLessons\.length\} Clases • \{productResources\.length\} Descargas/g, 'Curso Activo');

fs.writeFileSync(file, code);
