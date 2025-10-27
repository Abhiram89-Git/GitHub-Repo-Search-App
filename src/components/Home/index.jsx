import React, { useState, useEffect, useCallback, useMemo } from "react"
import "./index.css"

const RepoCard = React.memo(({ repo, isBookmarked, onToggleBookmark }) => {
  return (
    <div className="repo-card">
      <img src={repo.owner.avatar_url} alt={repo.name} className="avatar" />
      <div className="repo-details">
        <h3>{repo.name}</h3>
        <p className="description">{repo.description || "No description"}</p>
        <div className="repo-meta">
          ⭐ {repo.stargazers_count} • {repo.language || "N/A"}
        </div>
      </div>
      <span
        className={`bookmark-icon ${isBookmarked ? "bookmarked" : ""}`}
        onClick={() => onToggleBookmark(repo)}
      >
        ★
      </span>
    </div>
  )
})

const Home = () => {
  const [searchInput, setSearchInput] = useState("")
  const [repos, setRepos] = useState([])
  const [bookmarks, setBookmarks] = useState(
    JSON.parse(localStorage.getItem("bookmarks") || "[]")
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [filterBookmarked, setFilterBookmarked] = useState(false)

  const fetchRepos = useCallback(async (query) => {
    try {
      setLoading(true)
      setError("")
      const res = await fetch(
        `https://api.github.com/search/repositories?q=${query}&per_page=30`
      )
      if (!res.ok) throw new Error("Failed to fetch repositories")
      const data = await res.json()
      setRepos(data.items || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim() === "") {
        setRepos([])
        return
      }
      fetchRepos(searchInput)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput, fetchRepos])

  const toggleBookmark = useCallback(
    (repo) => {
      const isBookmarked = bookmarks.some((b) => b.id === repo.id)
      const updated = isBookmarked
        ? bookmarks.filter((b) => b.id !== repo.id)
        : [...bookmarks, repo]
      setBookmarks(updated)
      localStorage.setItem("bookmarks", JSON.stringify(updated))
    },
    [bookmarks]
  )

  const toggleFilter = useCallback(() => {
    setFilterBookmarked((prev) => !prev)
  }, [])

  const displayedRepos = useMemo(
    () => (filterBookmarked ? bookmarks : repos),
    [filterBookmarked, bookmarks, repos]
  )

  return (
    <div className="home">
      <div className="logo-dis">
        <img
          src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
          alt="GitHub"
          width="50"
          height="50"
        />
        <h1>Search GitHub Repositories</h1>
      </div>

      <div className="search-box">
        <input
          type="search"
          className="search-input"
          placeholder="Search repositories..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <span
          className={`filter-icon ${filterBookmarked ? "active" : ""}`}
          onClick={toggleFilter}
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bookmark-star-fill" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M2 15.5V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.74.439L8 13.069l-5.26 2.87A.5.5 0 0 1 2 15.5M8.16 4.1a.178.178 0 0 0-.32 0l-.634 1.285a.18.18 0 0 1-.134.098l-1.42.206a.178.178 0 0 0-.098.303L6.58 6.993c.042.041.061.1.051.158L6.39 8.565a.178.178 0 0 0 .258.187l1.27-.668a.18.18 0 0 1 .165 0l1.27.668a.178.178 0 0 0 .257-.187L9.368 7.15a.18.18 0 0 1 .05-.158l1.028-1.001a.178.178 0 0 0-.098-.303l-1.42-.206a.18.18 0 0 1-.134-.098z"/>
        </svg>
        </span>
      </div>

      {loading && <p className="status">⏳ Fetching repositories...</p>}
      {error && <p className="status error">⚠️ {error}</p>}
      {!loading && !error && displayedRepos.length === 0 && (
        searchInput.trim() === "" ? (
          <p className="status">🔍 Start typing to search for repositories...</p>
        ) : (
          <p className="status">❌ No repositories found for “{searchInput}”.</p>
        )
      )}


      <div className="repo-list">
        {displayedRepos.map((repo) => (
          <RepoCard
            key={repo.id}
            repo={repo}
            isBookmarked={bookmarks.some((b) => b.id === repo.id)}
            onToggleBookmark={toggleBookmark}
          />
        ))}
      </div>
    </div>
  )
}

export default Home
