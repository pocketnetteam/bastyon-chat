<template>
    <div class="card">
        <img class="picture" :src="image" alt="">
        <label class="name"> {{ name }} </label>
    </div>     
</template>

<script>
export default {
    name: 'UserCard',
    props: { 
        image: {
            type: String,
            default: ''
        },
        name: {
            type: String,
            default: ''
        }
    }

}
</script>

<style lang="sass" scoped>

.card 
    display: flex
    height: 50px
    align-items: center
    padding-left: 8px

.card:hover 
    background-color: rgba(112, 117, 121, 0.08);

.picture
    width: 30px
    height: 30px
    border-radius: 50%

.name 
    margin-left: 10px
    font-weight: 500
</style>