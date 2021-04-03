"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

//get star icon to be filled or not depending its favorite status
function favIcon(story, user) {
  if (user.isFavorite(story)) {
    return `<span class="favstar"><i class="bi bi-star-fill"></i></span>`
  } else {
    return `<span class="favstar"><i class="bi bi-star"></i></span>`
  }
  
}

function generateStoryMarkup(story, ownStories = false) {

  const hostName = story.getHostName();
  const loggedOn = Boolean(currentUser)

  return $(`
      <li id="${story.storyId}">
        ${currentUser ? favIcon(story, currentUser) : ""}
        
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        ${ownStories ? `<span class="trashcan"><i class="bi bi-trash"></i></span>` : ""}
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

//new Story form sumbit

async function newStoryFromSubmit(evt) {
  console.debug("submitNewStory")
  evt.preventDefault()

  const title = $("#title-input").val()
  const author = $("#author-input").val()
  const storyURL = $("#url-input").val()

  const newStory = await storyList.addStory(currentUser, {
    "title": title, 
    "author": author,
    "url": storyURL,
    "username": currentUser.username
  });

  const $newStory = generateStoryMarkup(newStory)
  $allStoriesList.prepend($newStory)


  $("#new-story-submit").hide()
  $("#new-story-submit").trigger("reset")

  storyList = await StoryList.getStories()
  putStoriesOnPage()
}

$("#new-story-submit").on("submit", newStoryFromSubmit)


//show Favorites page
function ShowFavoritesPage() {
  console.debug("ShowFavoritesPage")
  const $favoritesList = $('#favorite-stories-list')
  $favoritesList.empty()

  if (currentUser.favorites.length !== 0) {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story)
      $favoritesList.append($story)
    }
  } else {
    const $emptyMsg = $('<h1 id="empty-msg" class="display-5">You Don\'t Have Any Stories Here!</h1>')
    $favoritesList.append($emptyMsg)
  }

  $favoritesList.show()
}

//toggles the fill of the star icon and runs either deleteFavorite or addFavorite function
async function toggleFavorite(evt) {
  console.debug("toggleFavorite")
  const story = storyList.stories.find(userStory => userStory.storyId === $(evt.target).closest("li").attr("id"))

  if ($(evt.target).hasClass("bi-star-fill")) {
    await currentUser.deleteFavorite(story)
    $(evt.target).closest("i").removeClass("bi-star-fill")
    $(evt.target).closest("i").addClass("bi-star")
  } else {
    await currentUser.addFavorite(story)
    $(evt.target).closest("i").removeClass("bi-star")
    $(evt.target).closest("i").addClass("bi-star-fill")
  }
}
//adds event listener on the stars in $storiesLists
$storiesLists.on("click", ".favstar", toggleFavorite)

async function deleteStory(evt) {
  console.debug("deleteStory")
  const story = await storyList.stories.find(userStory => userStory.storyId === $(evt.target).closest("li").attr("id"))

  storyList.stories = storyList.stories.filter(sInList => sInList.storyId !== story.storyId)
  await currentUser.deleteStory(story)
  $(`#${story.storyId}`).remove()
  ShowMyStoriesPage()
}

//adds event listener on trashcans in $storiesLists
$storiesLists.on("click", ".trashcan", deleteStory)

//show My Stories page
function ShowMyStoriesPage() {
  console.debug("ShowMyStoriesPage")
  const $myStoriesList = $('#user-stories-list')
  $myStoriesList.empty()

  if (currentUser.ownStories.length !== 0) {
    for (let story of currentUser.ownStories) {
      const $story = generateStoryMarkup(story, true)
      $myStoriesList.append($story)
    }
  } else {
    const $emptyMsg = $('<h1 id="empty-msg" class="display-5">You Don\'t Have Any Stories Here!</h1>')
    $myStoriesList.append($emptyMsg)
  }

  $myStoriesList.show()
}