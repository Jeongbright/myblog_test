(function () {
  var titleEl = document.getElementById("post-title");
  var dateEl = document.getElementById("post-date");
  var contentEl = document.getElementById("post-content");

  function formatDate(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function showNotFound() {
    titleEl.textContent = "글을 찾을 수 없습니다";
    dateEl.textContent = "";
    contentEl.innerHTML =
      '<p><a href="index.html">← 글 목록으로 돌아가기</a></p>';
  }

  var slug = new URLSearchParams(window.location.search).get("slug");
  if (!slug) {
    showNotFound();
    return;
  }

  fetch("posts/posts.json")
    .then(function (res) {
      if (!res.ok) throw new Error("posts.json 로드 실패");
      return res.json();
    })
    .then(function (posts) {
      var post = posts.find(function (p) {
        return p.slug === slug;
      });
      if (!post) {
        showNotFound();
        return;
      }

      document.title = post.title;
      titleEl.textContent = post.title;
      dateEl.textContent = formatDate(post.date);

      return fetch("posts/" + post.file)
        .then(function (res) {
          if (!res.ok) throw new Error("글 파일 로드 실패: " + post.file);
          return res.text();
        })
        .then(function (markdown) {
          contentEl.innerHTML = marked.parse(markdown);
        });
    })
    .catch(function (err) {
      contentEl.innerHTML =
        '<p class="empty-state">글을 불러오지 못했습니다. (' +
        err.message +
        ")</p>";
    });
})();
