# CodeArchive

```Mermaid

| Endpoint            | Method | Source                     | Calls / Depends                                            | Notes                                                                            |
| ------------------- | ------ | -------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `/api/snippets`     | GET    | `routes/snippetsRouter.js` | `Snippet.find()`, `countDocuments()`                       | Returns `{total, skip, limit, items}`. Front-end expects `response.data.items`.  |
| `/api/snippets/:id` | GET    | `routes/snippetsRouter.js` | `Snippet.findById().populate('author')`                    | 404 if not found. Requires `author` field in model.                              |
| `/api/snippets`     | POST   | `routes/snippetsRouter.js` | `Snippet.create(req.body)`                                 | 201 on success. Validated by schema.                                             |
| `/api/snippets/:id` | PUT    | `routes/snippetsRouter.js` | `findByIdAndUpdate(..., { new:true, runValidators:true })` | 404 if missing.                                                                  |
| `/api/snippets/:id` | DELETE | `routes/snippetsRouter.js` | `findByIdAndDelete()`                                      | 204 No Content.                                                                  |
```