function main()
{
	c = new Cube(3);
	c.set_cell_ref(2, 0, 'x');
	c.rotate(2);
	c.print();
}