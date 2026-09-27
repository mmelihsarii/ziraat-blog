/**
 * Dosyanın görevi: Ziyaretçi ana sayfasının public verilerini sunucuda paralel getirip etkileşimli kabuğa aktarır.
 * Kullanıldığı yerler: Next.js dosya tabanlı rota sistemi tarafından doğrudan yüklenir.
 */
import type { Metadata } from 'next';
import HomeExperience from '@/components/HomeExperience';
import Hero from '@/components/Hero';
import MidBanner from '@/components/MidBanner';
import FeaturedTopics from '@/components/FeaturedTopics';
import Footer from '@/components/Footer';
import {
  getHeroContent,
  getPublishedCategories,
  getPublishedPosts,
  getPublicProfile,
} from '@/services/publicService';
import type { FeaturedTopic } from '@/types';

export const metadata: Metadata = {
  title: 'Ziraat Mühendisi Blogu',
  description: 'Tarım, ziraat mühendisliği, doğa ve sürdürülebilir üretim üzerine makaleler ve saha notları.',
};

/** Ziyaretçi ana sayfasının public verilerini sunucuda paralel getirip etkileşimli kabuğa aktarır. */
export default async function HomePage() {
  const [posts, categories, hero, profile] = await Promise.all([
    getPublishedPosts(),
    getPublishedCategories(),
    getHeroContent(),
    getPublicProfile(),
  ]);

  const topics: FeaturedTopic[] = categories
    .map((category) => {
      const cover = posts.find((post) => post.categories.includes(category.name))?.image;
      return cover
        ? {
            id: category.id,
            name: category.name,
            image: cover,
            href: `/makaleler?kategori=${encodeURIComponent(category.name)}`,
          }
        : null;
    })
    .filter((topic): topic is FeaturedTopic => topic !== null)
    .slice(0, 5);

  const featuredPost = posts.find((post) => post.featured) || posts[0];

  return (
    <HomeExperience
      posts={posts}
      categories={categories.map(({ name }) => name)}
      hero={
        <Hero
          title={hero.title}
          subtitle={hero.subtitle}
          backgroundImage={hero.image_url}
          buttonText={hero.button_text}
          buttonLink={hero.button_link}
          label={hero.label}
        />
      }
      middle={featuredPost ? (
        <MidBanner
          title={featuredPost.title}
          subtitle={featuredPost.excerpt}
          category={featuredPost.categories[0]}
          backgroundImage={featuredPost.image}
          buttonText="Makaleyi Oku"
          href={`/makaleler/${featuredPost.slug}`}
        />
      ) : null}
      topics={<FeaturedTopics topics={topics} />}
      footer={<Footer companyName="Ziraat Notları" profile={profile} />}
    />
  );
}
