import { prisma } from '@/lib/prisma'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import MultiImageUpload from '@/app/components/MultiImageUpload'
import DeleteButton from '@/app/components/DeleteButton'
import { createItem, createCategory, createStore, createYear, createBrand, deleteItem, deleteBrand, deleteCategory, deleteStore, deleteYear, logout } from '@/app/actions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const items = await prisma.item.findMany({ include: { store: true }, orderBy: { purchaseDate: 'desc' } })
  const categories = await prisma.category.findMany()
  const stores = await prisma.store.findMany()
  const years = await prisma.year.findMany({ orderBy: { value: 'desc' } })
  const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } })

  return (
    <>
      <Header />
      <div className="main-container" style={{ flexDirection: 'column', padding: '40px', gap: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="page-title" style={{ fontSize: '24px', marginBottom: 0 }}>Admin Dashboard</h1>
            <form action={logout}>
                <button type="submit" className="btn">Logout</button>
            </form>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            
            {/* Add Item Form */}
            <section>
                <h2 style={{ marginBottom: '20px' }}>Add New Purchase</h2>
                <form action={createItem} className="admin-form">
                    <label>Title</label>
                    <input name="title" required />
                    
                    <label>Price</label>
                    <input name="price" type="number" step="0.01" required />
                    
                    <label>Date (Optional for Wishlist)</label>
                    <input name="purchaseDate" type="date" />
                    
                    <label>Status</label>
                    <select name="status">
                        <option value="Delivered">Delivered</option>
                        <option value="Returned">Returned</option>
                        <option value="Pre-Order">Pre-Order</option>
                        <option value="Wishlist">Wishlist</option>
                    </select>

                    <label className="checkbox-label">
                        <input type="checkbox" name="isSubscription" value="true" />
                        <span>This is a subscription (monthly recurring)</span>
                    </label>

                    <label>Store</label>
                    <select name="storeId">
                        {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>

                    <label>Brand (Optional)</label>
                    <select name="brandId">
                        <option value="">-- Select Brand --</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>

                    <label>Category</label>
                    <select name="categoryId">
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    <label>Year</label>
                    <select name="yearId">
                        {years.map(y => <option key={y.id} value={y.id}>{y.value}</option>)}
                    </select>

                    <label>Images</label>
                    <MultiImageUpload />

                    <label>Or Image URLs (comma-separated)</label>
                    <input name="imageUrls" placeholder="https://..., https://..." />

                    <label>Rating (1-5)</label>
                    <select name="rating">
                        <option value="">-- No Rating --</option>
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Good</option>
                        <option value="3">3 - Average</option>
                        <option value="2">2 - Poor</option>
                        <option value="1">1 - Terrible</option>
                    </select>

                    <label>Review / Notes</label>
                    <textarea name="review" rows={4}></textarea>

                    <button type="submit">Add Purchase</button>
                </form>
            </section>

            {/* Manage Aux Data */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                <div>
                    <h2 style={{ marginBottom: '10px' }}>Manage Items</h2>
                    <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--color-border)' }}>
                        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', background: 'var(--color-card-bg)' }}>
                                    <th style={{ padding: '8px' }}>Title</th>
                                    <th style={{ padding: '8px' }}>Price</th>
                                    <th style={{ padding: '8px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        <td style={{ padding: '8px' }}>{item.title}</td>
                                        <td style={{ padding: '8px' }}>${Number(item.price).toFixed(2)}</td>
                                        <td style={{ padding: '8px', display: 'flex', gap: '8px' }}>
                                            <Link href={`/admin/edit/${item.id}`} className="btn btn-sm">Edit</Link>
                                            <form action={deleteItem.bind(null, item.id)}>
                                                <button className="btn btn-sm btn-danger">Del</button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <h3>Brands</h3>
                        <form action={createBrand} className="admin-form" style={{ marginTop: '10px' }}>
                            <input name="name" placeholder="Brand Name" required />
                            <button type="submit">Add</button>
                        </form>
                        {brands.length > 0 && (
                            <div className="entity-list">
                                {brands.map(b => (
                                    <div key={b.id} className="entity-item">
                                        <span>{b.name}</span>
                                        <DeleteButton id={b.id} deleteAction={deleteBrand} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h3>Categories</h3>
                        <form action={createCategory} className="admin-form" style={{ marginTop: '10px' }}>
                            <input name="name" placeholder="Category Name" required />
                            <button type="submit">Add</button>
                        </form>
                        {categories.length > 0 && (
                            <div className="entity-list">
                                {categories.map(c => (
                                    <div key={c.id} className="entity-item">
                                        <span>{c.name}</span>
                                        <DeleteButton id={c.id} deleteAction={deleteCategory} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <h3>Stores</h3>
                        <form action={createStore} className="admin-form" style={{ marginTop: '10px' }}>
                            <input name="name" placeholder="Store Name" required />
                            <button type="submit">Add</button>
                        </form>
                        {stores.length > 0 && (
                            <div className="entity-list">
                                {stores.map(s => (
                                    <div key={s.id} className="entity-item">
                                        <span>{s.name}</span>
                                        <DeleteButton id={s.id} deleteAction={deleteStore} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h3>Years</h3>
                        <form action={createYear} className="admin-form" style={{ marginTop: '10px' }}>
                            <input name="value" type="number" placeholder="Year (e.g. 2026)" required />
                            <button type="submit">Add</button>
                        </form>
                        {years.length > 0 && (
                            <div className="entity-list">
                                {years.map(y => (
                                    <div key={y.id} className="entity-item">
                                        <span>{y.value}</span>
                                        <DeleteButton id={y.id} deleteAction={deleteYear} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </section>
        </div>
      </div>
      <Footer />
    </>
  )
}