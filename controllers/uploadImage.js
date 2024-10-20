async function uploadImage(e) {
	let file = e.target.files[0];

	const { data, error } = await supabase.storage
		.from("uploads")
		.upload(userId + "/" + uuidv4(), file);

	if (data) {
		getMedia();
	} else {
		console.log(error);
	}
}
