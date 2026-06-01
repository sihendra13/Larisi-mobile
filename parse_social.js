function normalizeAccount(a, platform) {
  var apiAvatarUrl = a.profile_photo_url
                   || a.profile_picture_url || a.picture || a.avatar
                   || a.profile_image_url   || a.photo_url || a.image_url
                   || a.profile_photo       || a.profile_pic
                   || (a.user && (a.user.profile_picture_url || a.user.picture))
                   || '';
  if (apiAvatarUrl && typeof apiAvatarUrl === 'object') {
    apiAvatarUrl = apiAvatarUrl.data?.url || apiAvatarUrl.url || '';
  }
  var apiUsername = a.username || a.handle || a.name || a.title || '';
  return {
    id: a.id,
    platform: platform || a.platform || '',
    username: apiUsername,
    avatar_url: apiAvatarUrl
  };
}
console.log(normalizeAccount({ name: "VespaKita", picture: { data: { url: "http://fb.com/pic" } } }, 'facebook'));
