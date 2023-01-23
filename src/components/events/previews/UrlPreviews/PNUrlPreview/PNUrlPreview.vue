<template>
	<div class="PNpreviewMetaLink">
		<div class="post" v-if="post.is_post">
			<div class="header">
				<img class="image" v-if="post.userpic" :src="post.userpic" alt="" />
				<span class="title text-padding">{{ post.name }}</span>
			</div>

			<div class="prev-content text-padding">
				<span class="text">{{ post.text }}</span>

				<div class="tags-wrapper">
					<template v-for="item in post.tags">
						<a class="tag" :href="createLink(item)"
							><span>#{{ item }}</span></a
						>
					</template>
				</div>

				<div class="url-preview" v-if="post.text_url">
					<a class="url-preview-header" :href="post.header">{{
						post.text_url.title
					}}</a>
					<span class="url-preview-text">{{ post.text_url.desctiption }}</span>
				</div>

				<div class="last-comment-wrapper" v-if="post.last_comment">
					<span class="last-comment-header">{{
						$t("caption.recentComment")
					}}</span>
					<div class="last-comment">{{ post.last_comment }}</div>
				</div>

				<div class="info-content">
					<div class="rating" v-if="post.rating">
						<span class="rating-star" v-for="item in post.rating.stars">{{
							item
						}}</span>
						<span class="rating-value">{{ post.rating.score }}</span>
					</div>

					<div class="share" v-if="post.rating">
						<span class="share-text">{{ $t("caption.share") }}</span>
						<i class="fas fa-share-alt"></i>
					</div>
				</div>

				<span class="post-time" v-if="post.date">{{ post.date }}</span>
			</div>

			<img
				class="post-picture"
				v-if="post.image"
				:src="post.image"
				alt="Post picture"
			/>

			<Player v-if="post.video" :video_url="post.video" :autoplay="true" />
		</div>

		<div class="profile" v-else>
			<span class="username">{{ post.header }}</span>
			<img class="user-picture" :src="post.userpic" alt="User picture" />
			<div class="user-info">
				<span>{{ $t("caption.followers") }} {{ post.followers }}</span>
				<span> {{ $t("caption.reputation") }} {{ post.reputation }}</span>
				<span>{{ $t("caption.following") }} {{ post.following }}</span>
			</div>

			<button class="profile-button">
				<a :href="post.url">{{ $t("button.goToPocketnetProfile") }}</a>
			</button>
		</div>
	</div>
</template>

<script>
import Player from "@/components/chat/player/Player.vue";

export default {
	components: {
		Player,
	},

	props: {
		post: Object,
	},

	data() {
		return {
			player: null,
		};
	},

	watch: {},

	mounted() {},

	methods: {
		createLink(tag) {
			return (
				`https://` +
				(window.pocketnetdomain || "pocketnet.app") +
				`/s?ss=tag:${tag}`
			);
		},
	},
};
</script>

<style lang="sass" scoped>
.PNpreviewMetaLink
    display: flex
    flex-direction: column
    padding-top: 8px
    -webkit-box-shadow: 0px -1px 15px -5px #0059ff
    -moz-box-shadow: 0px -1px 15px -5px #0059ff
    box-shadow: 0px -1px 15px -5px #0059ff


    .profile
        display: flex
        flex-direction: column
        align-items: center
        padding: $r

    .username
        font-size: 2em
        font-weight: 100

    .user-picture
        width: 120px
        height: 120px
        margin: 15px 0 30px
        border-radius: 70px

    .user-info
        width: 100%
        display: flex
        justify-content: space-between

    .profile-button
      width: 200px
      background-color: #e4e4e4
      margin: 5 * $r 0 3 * $r
      padding: $r
      border-radius: 7px

    .header
        display: flex
        justify-content: flex-start
        align-items: center

    .title
        min-height: 30px
        font-weight: bold
        display: block
        font-size: 0.9em

    .prev-content
        margin-top: 10px
        .url-preview
            padding: 3px
            border-radius: 5px
            box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px
            display: flex
            flex-direction: column
            margin: 10px 0
            font-size: 12px
            .url-preview-header
                font-weight: bold
                text-decoration: underline
                color: $classic-color-text-second

        .last-comment-wrapper
            display: flex
            flex-direction: column
            .last-comment-header
                font-weight: 500
            .last-comment
                margin-top: 5px
                padding: $r
                border-radius: 15px
                color: white
                background-color: #0059ff

    .tag
        margin-right: 5px
        color: $classic-color-text-second
        font-size: .7em

    .text-padding
        padding: 0 $r * 2

    .tags-wrapper
        display: flex
        flex-wrap: wrap
        margin-top: 10px

    .post-picture
        width: 100%

    .image
        width: 50px
        height: 50px
        border-radius: 30px
        margin-left: 15px

    .video
        width: 100%

    .post-time
        padding: 10px 0 5px
        font-size: 12px
        font-weight: 650

    .info-content
        margin: 10px 0 5px
        display: flex
        justify-content: space-between
        align-items: center


    .rating
        margin: 5px 0 5px
        .rating-star
            margin-right: 3px
        .rating-value
            margin-left: 15px
    .share
        .share-text
            margin-right: 10px
</style>
