import React, { useState, useEffect, useRef } from "react";
import "./App.scss";

interface Image {
  name: string;
  "poster-image": string;
}

type CustomImage = Image & {
  loaded: boolean;
};

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [images, setImages] = useState<CustomImage[]>([]);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchUIOpen, setSearchUIOpen] = useState(false);

  useEffect(() => {
    fetch("https://test.create.diagnal.com/data/page1.json")
      .then((response) => response.json())
      .then((data) => {
        const contentItems = data.page["content-items"].content;

        const customImages: CustomImage[] = contentItems.map((item: { [x: string]: any; name: any; }) => ({
          name: item.name,
          "poster-image": item["poster-image"],
          loaded: false,
        }));

        setImages(customImages);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });

    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const imgUrl = img.dataset.src;
            if (imgUrl) {
              img.src = imgUrl;
              const imgIndex = imageRefs.current.indexOf(img);
              if (imgIndex !== -1) {
                setImages((prevImages) =>
                  prevImages.map((image, index) =>
                    index === imgIndex ? { ...image, loaded: true } : image
                  )
                );
              }
              observer.unobserve(img);
            }
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );

    imageRefs.current.forEach((img, index) => {
      if (img && !images[index].loaded) {
        observer.observe(img);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [images]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const filteredImages = images.filter((image) =>
    image.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`app ${isScrolled ? "scrolled" : ""}`}>
      <header
        className={`app-header ${isScrolled ? "with-shadow" : ""}`}
        style={{ zIndex: isScrolled ? 1 : "auto" }}
      >
        <div className="app-title-wrap">
          <button className="back-button">
            <img src={`${process.env.PUBLIC_URL}/images/Back.png`} alt="Back" />
          </button>
          <h1>Romantic Comedies</h1>
        </div>

        <div className="search-wrap">
          <button
            className="search-ui-toggle-button"
            onClick={() => setSearchUIOpen(!searchUIOpen)}
          >
            <img
              src={`${process.env.PUBLIC_URL}/images/search.png`}
              alt="Search"
            />
          </button>

          {searchUIOpen && (
            <input
              type="text"
              placeholder="Search images..."
              value={searchTerm}
              onChange={handleSearch}
            />
          )}
        </div>
      </header>

      <main className="image-grid">
        {filteredImages.map((image, index) => (
          <div key={index} className="image-item">
            <img
              key={index}
              ref={(el) => (imageRefs.current[index] = el)}
              alt={image.name}
              data-src={
                image.loaded
                  ? `${process.env.PUBLIC_URL}/images/${image["poster-image"]}`
                  : ""
              }
              src={`${process.env.PUBLIC_URL}/images/${image["poster-image"]}`}
            />
            <h5>{image.name}</h5>
          </div>
        ))}
      </main>
    </div>
  );
};

export default App;
