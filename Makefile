


run:
	@python -m dpss.server

update:
	@rsync -avz --files-from=files.txt . root@10.90.0.45:/web/aijobwars.com/