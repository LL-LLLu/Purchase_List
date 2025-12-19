'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import path from 'path'
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'

export async function login(formData: FormData) {
  const password = formData.get('password') as string
  const correctPassword = process.env.ADMIN_PASSWORD || 'admin'

  if (password === correctPassword) {
    const cookieStore = await cookies()
    cookieStore.set('admin_session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    redirect('/admin')
  } else {
    redirect('/login?error=Invalid password')
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/login')
}

async function saveImage(file: File): Promise<string | null> {
  if (!file || file.size === 0 || file.name === 'undefined') return null

  const filename = `${uuidv4()}${path.extname(file.name)}`
  const blob = await put(filename, file, {
    access: 'public',
  });

  return blob.url;
}

export async function createItem(formData: FormData) {
  const title = formData.get('title') as string
  const price = parseFloat(formData.get('price') as string)

  const dateStr = formData.get('purchaseDate') as string
  const purchaseDate = dateStr ? new Date(dateStr) : null

  const status = formData.get('status') as string
  const isSubscription = formData.get('isSubscription') === 'true'
  const storeId = parseInt(formData.get('storeId') as string)
  const categoryId = parseInt(formData.get('categoryId') as string)
  const yearId = parseInt(formData.get('yearId') as string)
  const brandIdStr = formData.get('brandId') as string
  const brandId = brandIdStr ? parseInt(brandIdStr) : null

  const ratingStr = formData.get('rating') as string
  const rating = ratingStr ? parseInt(ratingStr) : null

  const review = formData.get('review') as string

  // Handle multiple images
  const imageFiles = formData.getAll('imageFiles') as File[]
  const imageUrls = formData.get('imageUrls') as string

  console.log('=== Image Upload Debug (createItem) ===')
  console.log('Number of files received:', imageFiles.length)
  imageFiles.forEach((file, i) => {
    console.log(`File ${i}: name="${file.name}", size=${file.size}, type="${file.type}"`)
  })

  const imagesToCreate: { url: string; order: number }[] = []

  // Process uploaded files
  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i]
    if (file && file.size > 0 && file.name !== 'undefined') {
      const savedPath = await saveImage(file)
      if (savedPath) {
        imagesToCreate.push({ url: savedPath, order: i })
        console.log(`Saved file ${i}: ${savedPath}`)
      }
    }
  }

  // Process image URLs (comma-separated)
  if (imageUrls) {
    const urls = imageUrls.split(',').map(u => u.trim()).filter(u => u)
    urls.forEach((url, index) => {
      imagesToCreate.push({ url, order: imagesToCreate.length + index })
    })
  }

  await prisma.item.create({
    data: {
      title,
      price,
      purchaseDate,
      status,
      isSubscription,
      storeId,
      categoryId,
      yearId,
      brandId,
      rating,
      review,
      images: {
        create: imagesToCreate
      }
    }
  })

  revalidatePath('/')
  revalidatePath('/admin')
  redirect('/admin')
}

export async function createBrand(formData: FormData) {
  const name = formData.get('name') as string
  await prisma.brand.create({ data: { name } })
  revalidatePath('/admin')
}

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string
  await prisma.category.create({ data: { name } })
  revalidatePath('/admin')
}

export async function createStore(formData: FormData) {
  const name = formData.get('name') as string
  await prisma.store.create({ data: { name } })
  revalidatePath('/admin')
}

export async function createYear(formData: FormData) {
  const value = parseInt(formData.get('value') as string)
  await prisma.year.create({ data: { value } })
  revalidatePath('/admin')
}

export async function deleteItem(id: number) {
  await prisma.item.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/admin')
}

export async function deleteItemImage(imageId: number) {
  await prisma.itemImage.delete({ where: { id: imageId } })
  revalidatePath('/')
  revalidatePath('/admin')
}

export async function setImageAsCover(imageId: number) {
  // Get the image to find its itemId
  const image = await prisma.itemImage.findUnique({ where: { id: imageId } })
  if (!image) return

  // Remove cover from all images of this item
  await prisma.itemImage.updateMany({
    where: { itemId: image.itemId },
    data: { isCover: false }
  })

  // Set the selected image as cover
  await prisma.itemImage.update({
    where: { id: imageId },
    data: { isCover: true }
  })

  revalidatePath('/')
  revalidatePath('/admin')
}

export async function updateItem(id: number, formData: FormData) {
  const title = formData.get('title') as string
  const price = parseFloat(formData.get('price') as string)

  const dateStr = formData.get('purchaseDate') as string
  const purchaseDate = dateStr ? new Date(dateStr) : null

  const status = formData.get('status') as string
  const isSubscription = formData.get('isSubscription') === 'true'
  const storeId = parseInt(formData.get('storeId') as string)
  const categoryId = parseInt(formData.get('categoryId') as string)
  const yearId = parseInt(formData.get('yearId') as string)
  const brandIdStr = formData.get('brandId') as string
  const brandId = brandIdStr ? parseInt(brandIdStr) : null

  const ratingStr = formData.get('rating') as string
  const rating = ratingStr ? parseInt(ratingStr) : null

  const review = formData.get('review') as string

  // Handle new images
  const imageFiles = formData.getAll('imageFiles') as File[]
  const imageUrls = formData.get('imageUrls') as string

  console.log('=== Image Upload Debug (updateItem) ===')
  console.log('Number of files received:', imageFiles.length)
  imageFiles.forEach((file, i) => {
    console.log(`File ${i}: name="${file.name}", size=${file.size}, type="${file.type}"`)
  })

  // Get current max order
  const existingImages = await prisma.itemImage.findMany({
    where: { itemId: id },
    orderBy: { order: 'desc' },
    take: 1
  })
  let nextOrder = existingImages.length > 0 ? existingImages[0].order + 1 : 0

  const imagesToCreate: { url: string; order: number }[] = []

  // Process uploaded files
  for (const file of imageFiles) {
    if (file && file.size > 0 && file.name !== 'undefined') {
      const savedPath = await saveImage(file)
      if (savedPath) {
        imagesToCreate.push({ url: savedPath, order: nextOrder++ })
        console.log(`Saved file: ${savedPath}`)
      }
    }
  }

  // Process image URLs (comma-separated)
  if (imageUrls) {
    const urls = imageUrls.split(',').map(u => u.trim()).filter(u => u)
    urls.forEach(url => {
      imagesToCreate.push({ url, order: nextOrder++ })
    })
  }

  await prisma.item.update({
    where: { id },
    data: {
      title,
      price,
      purchaseDate,
      status,
      isSubscription,
      storeId,
      categoryId,
      yearId,
      brandId,
      rating,
      review,
      images: {
        create: imagesToCreate
      }
    }
  })

  revalidatePath('/')
  revalidatePath('/admin')
  redirect('/admin')
}
