(function () {
  var listEl = document.getElementById("post-list");

  function formatDate(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function renderPosts(posts) {
    if (!posts.length) {
      listEl.innerHTML = '<li class="empty-state">아직 작성된 글이 없습니다.</li>';
      return;
    }

    posts
      .slice()
      .sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      })
      .forEach(function (post) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.className = "post-card";
        a.href = "post.html?slug=" + encodeURIComponent(post.slug);

        var title = document.createElement("h2");
        title.className = "post-card-title";
        title.textContent = post.title;

        var date = document.createElement("span");
        date.className = "post-card-date";
        date.textContent = formatDate(post.date);

        var summary = document.createElement("p");
        summary.className = "post-card-summary";
        summary.textContent = post.summary || "";

        a.appendChild(title);
        a.appendChild(date);
        a.appendChild(summary);
        li.appendChild(a);
        listEl.appendChild(li);
      });
  }

  fetch("posts/posts.json")
    .then(function (res) {
      if (!res.ok) throw new Error("posts.json 로드 실패");
      return res.json();
    })
    .then(renderPosts)
    .catch(function (err) {
      listEl.innerHTML =
        '<li class="empty-state">글 목록을 불러오지 못했습니다. (' +
        err.message +
        ")</li>";
    });
})();
