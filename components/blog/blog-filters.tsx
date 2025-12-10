"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Clock, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { BlogPost } from "@/lib/data/blog-posts";

interface BlogFiltersProps {
  posts: BlogPost[];
  categories: string[];
}

export function BlogFilters({ posts, categories }: BlogFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.description.toLowerCase().includes(query) ||
          post.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [posts, selectedCategory, searchQuery]);

  const hasFilters = selectedCategory || searchQuery.trim();

  return (
    <>
      {/* Search Input */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div
        className="flex flex-wrap justify-center gap-2 mb-12"
        role="group"
        aria-label="Filter by category"
      >
        <Badge
          variant="outline"
          role="button"
          tabIndex={0}
          aria-pressed={selectedCategory === null}
          onClick={() => setSelectedCategory(null)}
          onKeyDown={(e) => e.key === "Enter" && setSelectedCategory(null)}
          className={`cursor-pointer transition-all duration-200 ${
            selectedCategory === null
              ? "bg-amber-500 text-white border-amber-500 hover:bg-amber-600 hover:border-amber-600"
              : "hover:bg-amber-100 hover:border-amber-300 hover:scale-105 dark:hover:bg-amber-900/30 dark:hover:border-amber-700"
          }`}
        >
          All Posts
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category}
            variant="outline"
            role="button"
            tabIndex={0}
            aria-pressed={selectedCategory === category}
            aria-label={`Filter by ${category}`}
            onClick={() => setSelectedCategory(category)}
            onKeyDown={(e) => e.key === "Enter" && setSelectedCategory(category)}
            className={`cursor-pointer transition-all duration-200 ${
              selectedCategory === category
                ? "bg-amber-500 text-white border-amber-500 hover:bg-amber-600 hover:border-amber-600"
                : "hover:bg-amber-100 hover:border-amber-300 hover:scale-105 dark:hover:bg-amber-900/30 dark:hover:border-amber-700"
            }`}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Results Count */}
      {hasFilters && (
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground">
            Showing {filteredPosts.length} of {posts.length} articles
            {selectedCategory && (
              <span>
                {" "}
                in <span className="font-medium">{selectedCategory}</span>
              </span>
            )}
            {searchQuery.trim() && (
              <span>
                {" "}
                matching &quot;<span className="font-medium">{searchQuery}</span>&quot;
              </span>
            )}
          </p>
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery("");
            }}
            className="text-amber-600 hover:text-amber-700"
          >
            Clear all filters
          </Button>
        </div>
      )}

      {/* Posts Grid */}
      <section>
        <h2 className="text-2xl font-serif font-bold mb-8 flex items-center gap-2">
          {selectedCategory || "All Articles"}
          <span className="text-muted-foreground font-normal text-lg">
            ({filteredPosts.length})
          </span>
        </h2>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No articles found matching your criteria.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery("");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                <article className="h-full bg-card border rounded-2xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 hover:border-amber-300 dark:hover:border-amber-700 flex flex-col">
                  <Badge
                    variant="secondary"
                    className="w-fit mb-4 bg-amber-100/50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                  >
                    {post.category}
                  </Badge>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-grow">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readingTime}
                    </span>
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
